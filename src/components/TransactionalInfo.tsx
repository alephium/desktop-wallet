/*
Copyright 2018 - 2022 The Alephium Authors
This file is part of the alephium project.

The library is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with the library. If not, see <http://www.gnu.org/licenses/>.
*/

import { calAmountDelta } from '@alephium/sdk'
import { Output, Transaction } from '@alephium/sdk/api/explorer'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import styled, { useTheme } from 'styled-components'

import { AddressHash, SimpleTx, TransactionDirection, useAddressesContext } from '../contexts/addresses'
import { isExplorerTransaction, isSimpleTx } from '../utils/transactions'
import AddressBadge from './AddressBadge'
import Amount from './Amount'
import Badge from './Badge'
import DirectionalArrow from './DirectionalArrow'
import IOList from './IOList'
import TimeSince from './TimeSince'
import Token from './Token'

interface TransactionalInfoProps {
  transaction: Transaction | SimpleTx
  addressHash?: string
  className?: string
  hideLabel?: boolean
}

const TransactionalInfo = ({ transaction: tx, addressHash, className, hideLabel }: TransactionalInfoProps) => {
  const { addressHash: addressHashParam = '' } = useParams<{ addressHash: AddressHash }>()
  const _addressHash = addressHash ?? addressHashParam

  const { getAddress } = useAddressesContext()
  const theme = useTheme()
  const { t } = useTranslation('App')

  const address = getAddress(_addressHash)

  let amount: bigint | undefined = BigInt(0)
  let timestamp = 0
  let type: TransactionDirection
  let outputs: Output[] = []

  const token = 'alph'

  if (isExplorerTransaction(tx)) {
    amount = calAmountDelta(tx, _addressHash)
    const amountIsBigInt = typeof amount === 'bigint'
    type = amount && amountIsBigInt && amount < 0 ? 'out' : 'in'
    amount = amount && (type === 'out' ? amount * BigInt(-1) : amount)
    timestamp = tx.timestamp
    outputs = tx.outputs || []
  } else if (isSimpleTx(tx)) {
    type = tx.type === 'transfer' ? 'out' : 'in'
    amount = tx.amount
    timestamp = tx.timestamp
    outputs = [{ hint: 0, key: '', amount: '', address: tx.toAddress }]
  } else {
    throw new Error('Could not determine transaction type, all transactions should have a type')
  }

  return (
    <Container className={className} theme={theme}>
      <CellTokenTime>
        <CellArrow>
          <DirectionalArrow direction={type} />
        </CellArrow>
        <TokenTimeInner>
          <TokenStyled type={token} />
          <TimeSince timestamp={timestamp} faded />
        </TokenTimeInner>
      </CellTokenTime>
      {address && (
        <>
          <CellAddress>
            {!hideLabel && (
              <CellAddressBadge>
                <AddressBadge address={address} truncate />
              </CellAddressBadge>
            )}
            <DirectionalAddress>
              {type === 'out' && <DirectionBadgeOut>{t`to`}</DirectionBadgeOut>}
              {type !== 'out' && <DirectionBadgeIn>{t`from`}</DirectionBadgeIn>}
              <IOList
                currentAddress={_addressHash || ''}
                isOut={type === 'out'}
                outputs={outputs}
                inputs={(tx as Transaction).inputs}
                timestamp={(tx as Transaction).timestamp}
                truncate
              />
            </DirectionalAddress>
          </CellAddress>
        </>
      )}
      {amount && (
        <CellAmount>
          <CellAmountInner>
            {type === 'out' ? '-' : '+'}
            <Amount value={amount} fadeDecimals />
          </CellAmountInner>
        </CellAmount>
      )}
    </Container>
  )
}

export default TransactionalInfo

const CellArrow = styled.div`
  margin-right: 25px;
`

const CellTokenTime = styled.div`
  display: flex;
  align-items: center;
  margin-right: 28px;
  text-align: left;
  flex-grow: 1;
`

const TokenTimeInner = styled.div`
  width: 9em;
`

const CellAddressBadge = styled.div`
  min-width: 100px;
  max-width: 100px;
  margin-right: 21px;
`

const CellAddress = styled.div`
  flex-shrink: 1;
  min-width: 0;
  margin-right: 21px;
  display: flex;
  flex-basis: 580px;
`

const TokenStyled = styled(Token)`
  font-weight: var(--fontWeight-semiBold);
`

const CellAmount = styled.div`
  flex-grow: 1;
  text-align: right;
`

const CellAmountInner = styled.div`
  min-width: 6em;
`

const Container = styled.div`
  display: flex;
  text-align: center;
  border-radius: 3px;
  white-space: nowrap;
  align-items: center;
  flex-grow: 1;
`

const BadgeStyled = styled(Badge)`
  min-width: 50px;
  text-align: center;
`

const DirectionBadgeOut = styled(BadgeStyled)`
  background-color: ${({ theme }) => theme.bg.secondary};
`

const DirectionBadgeIn = styled(BadgeStyled)`
  background-color: ${({ theme }) => theme.bg.accent};
`

const DirectionalAddress = styled.div`
  display: flex;
  align-items: baseline;
  gap: var(--spacing-4);
  max-width: 100%;
  min-width: 0;
`
