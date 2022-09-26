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

import { calAmountDelta, formatAmountForDisplay } from '@alephium/sdk'
import { Output, Transaction } from '@alephium/sdk/api/explorer'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import styled, { css } from 'styled-components'

import { AddressHash, PendingTx, useAddressesContext } from '../contexts/addresses'
import { isExplorerTransaction, isPendingTx, TransactionDirection } from '../utils/transactions'
import AddressBadge from './AddressBadge'
import AddressEllipsed from './AddressEllipsed'
import Amount from './Amount'
import Badge from './Badge'
import DirectionalArrow from './DirectionalArrow'
import HiddenLabel from './HiddenLabel'
import IOList from './IOList'
import Lock from './Lock'
import TimeSince from './TimeSince'
import Token from './Token'

interface TransactionalInfoProps {
  transaction: Transaction | PendingTx
  addressHash?: AddressHash
  hideLeftAddress?: boolean
  className?: string
}

const TransactionalInfo = ({ transaction: tx, addressHash, className, hideLeftAddress }: TransactionalInfoProps) => {
  const { addressHash: addressHashParam = '' } = useParams<{ addressHash: AddressHash }>()
  const _addressHash = addressHash ?? addressHashParam

  const { getAddress } = useAddressesContext()
  const { t } = useTranslation('App')

  const address = getAddress(_addressHash)

  let amount: bigint | undefined = BigInt(0)
  let timestamp = 0
  let type: TransactionDirection
  let outputs: Output[] = []
  let pendingToAddressComponent
  let lockTime: Date | undefined

  const token = 'alph'

  if (isExplorerTransaction(tx)) {
    amount = calAmountDelta(tx, _addressHash)
    const amountIsBigInt = typeof amount === 'bigint'
    type = amount && amountIsBigInt && amount < 0 ? 'out' : 'in'
    amount = amount && (type === 'out' ? amount * BigInt(-1) : amount)
    timestamp = tx.timestamp
    outputs = tx.outputs || []
    lockTime = outputs.reduce((a, b) => (a > new Date(b.lockTime ?? 0) ? a : new Date(b.lockTime ?? 0)), new Date(0))
    lockTime = lockTime.toISOString() == new Date(0).toISOString() ? undefined : lockTime
  } else if (isPendingTx(tx)) {
    type = 'out'
    amount = tx.amount
    timestamp = tx.timestamp
    const pendingToAddress = getAddress(tx.toAddress)
    pendingToAddressComponent = pendingToAddress ? (
      <AddressBadge truncate address={pendingToAddress} showHashWhenNoLabel />
    ) : (
      <AddressEllipsed addressHash={tx.toAddress} />
    )
    outputs = [{ hint: 0, key: '', amount: '', address: tx.toAddress }]
    lockTime = tx.lockTime
  } else {
    throw new Error('Could not determine transaction type, all transactions should have a type')
  }

  if (!address) return null

  return (
    <div className={className}>
      <CellAmountTokenTime>
        <CellArrow>
          <DirectionalArrow direction={type} />
        </CellArrow>
        <TokenTimeInner>
          <HiddenLabel text={formatAmountForDisplay(BigInt(amount ?? 0))} />
          <TokenStyled type={token} />
          <TimeSince timestamp={timestamp} faded />
        </TokenTimeInner>
      </CellAmountTokenTime>
      {!hideLeftAddress && (
        <CellAddress alignRight>
          <HiddenLabel text={type === 'out' ? t`out from` : t`into`} />
          <AddressBadgeStyled address={address} truncate showHashWhenNoLabel withBorders />
        </CellAddress>
      )}
      <CellDirection>{type === 'out' ? t`to` : t`from`}</CellDirection>
      <CellAddress>
        <DirectionalAddress>
          {pendingToAddressComponent || (
            <IOList
              currentAddress={_addressHash || ''}
              isOut={type === 'out'}
              outputs={outputs}
              inputs={(tx as Transaction).inputs}
              timestamp={(tx as Transaction).timestamp}
              truncate
            />
          )}
        </DirectionalAddress>
      </CellAddress>
      {!!amount && (
        <CellAmount aria-hidden="true">
          <Lock unlockAt={lockTime} /> {type === 'out' ? '-' : '+'}
          <Amount value={amount} fadeDecimals />
        </CellAmount>
      )}
    </div>
  )
}

export default styled(TransactionalInfo)`
  display: flex;
  text-align: center;
  border-radius: 3px;
  white-space: nowrap;
  align-items: center;
  flex-grow: 1;
`

const CellArrow = styled.div`
  margin-right: 25px;
`

const CellAmountTokenTime = styled.div`
  display: flex;
  align-items: center;
  margin-right: 28px;
  text-align: left;
  flex-grow: 1;
`

const TokenTimeInner = styled.div`
  width: 9em;
`

const CellAddress = styled.div<{ alignRight?: boolean }>`
  min-width: 0;
  max-width: 400px;
  flex-grow: 1;
  align-items: baseline;
  margin-right: 21px;
  margin-left: 21px;
  display: flex;
  width: 100%;

  ${({ alignRight }) =>
    alignRight &&
    css`
      justify-content: flex-end;
    `}
`

const TokenStyled = styled(Token)`
  font-weight: var(--fontWeight-semiBold);
`

const CellAmount = styled.div`
  flex-grow: 1;
  justify-content: right;
  display: flex;
  min-width: 6em;
  flex-basis: 120px;
  display: flex;
  align-items: center;

  & > ${Lock} {
    margin-right: 6px;
  }
`

const BadgeStyled = styled(Badge)`
  min-width: 50px;
  text-align: center;
`

const CellDirection = styled(BadgeStyled)`
  ${({ theme }) => css`
    color: ${theme.font.secondary};
    background-color: ${theme.bg.accent};
  `}
`

const DirectionalAddress = styled.div`
  display: flex;
  align-items: baseline;
  gap: var(--spacing-4);
  max-width: 100%;
  min-width: 0;
`

const AddressBadgeStyled = styled(AddressBadge)`
  justify-content: flex-end;
`
