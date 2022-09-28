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
import { AssetOutput, Output, Transaction } from '@alephium/sdk/api/explorer'
import { colord } from 'colord'
import { ArrowRight as ArrowRightIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import styled, { css, useTheme } from 'styled-components'

import { AddressHash, PendingTx, useAddressesContext } from '../contexts/addresses'
import {
  getDirection,
  hasOnlyOutputsWith,
  isExplorerTransaction,
  isPendingTx,
  TransactionDirection,
  TransactionInfoType
} from '../utils/transactions'
import AddressBadge from './AddressBadge'
import AddressEllipsed from './AddressEllipsed'
import Amount from './Amount'
import HiddenLabel from './HiddenLabel'
import IOList from './IOList'
import Lock from './Lock'
import TimeSince from './TimeSince'
import Token from './Token'
import TransactionIcon from './TransactionIcon'

const token = 'alph'

interface TransactionalInfoProps {
  transaction: Transaction | PendingTx
  addressHash?: AddressHash
  hideLeftAddress?: boolean
  className?: string
}

const TransactionalInfo = ({ transaction: tx, addressHash, className, hideLeftAddress }: TransactionalInfoProps) => {
  const { addressHash: addressHashParam = '' } = useParams<{ addressHash: AddressHash }>()
  const _addressHash = addressHash ?? addressHashParam

  const { addresses, getAddress } = useAddressesContext()
  const { t } = useTranslation('App')
  const { label, amountTextColor } = useTransactionalInfoSettings()

  const address = getAddress(_addressHash)

  if (!address) return null

  let amount: bigint | undefined = BigInt(0)
  let timestamp = 0
  let direction: TransactionDirection
  let infoType: TransactionInfoType
  let outputs: Output[] = []
  let pendingToAddressComponent
  let lockTime: Date | undefined

  if (!_addressHash) return null

  if (isExplorerTransaction(tx)) {
    amount = calAmountDelta(tx, _addressHash)
    direction = getDirection(tx, _addressHash)
    infoType =
      !hideLeftAddress && direction === 'out' && hasOnlyOutputsWith(tx.outputs ?? [], addresses) ? 'move' : direction
    amount = amount && (direction === 'out' ? amount * BigInt(-1) : amount)
    timestamp = tx.timestamp
    outputs = tx.outputs || []
    lockTime = outputs.reduce(
      (a, b) => (a > new Date((b as AssetOutput).lockTime ?? 0) ? a : new Date((b as AssetOutput).lockTime ?? 0)),
      new Date(0)
    )
    lockTime = lockTime.toISOString() == new Date(0).toISOString() ? undefined : lockTime
  } else if (isPendingTx(tx)) {
    direction = 'out'
    infoType = 'pending'
    amount = tx.amount
    timestamp = tx.timestamp

    const pendingToAddress = getAddress(tx.toAddress)
    pendingToAddressComponent = pendingToAddress ? (
      <AddressBadge truncate address={pendingToAddress} showHashWhenNoLabel withBorders />
    ) : (
      <AddressEllipsed addressHash={tx.toAddress} />
    )
    outputs = [{ hint: 0, key: '', type: '', attoAlphAmount: '', address: tx.toAddress }]
    lockTime = tx.lockTime
  } else {
    throw new Error('Could not determine transaction type, all transactions should have a type')
  }

  return (
    <div className={className}>
      <CellTime>
        <CellArrow>
          <TransactionIcon type={infoType} />
        </CellArrow>
        <TokenTimeInner>
          {label[infoType]}
          <HiddenLabel text={formatAmountForDisplay(BigInt(amount ?? 0))} />
          <TimeSince timestamp={timestamp} faded />
        </TokenTimeInner>
      </CellTime>
      <CellToken>
        <TokenStyled type={token} />
      </CellToken>
      {!hideLeftAddress && (
        <CellAddress alignRight>
          <HiddenLabel text={t`from`} />
          {direction === 'out' && <AddressBadgeStyled address={address} truncate showHashWhenNoLabel withBorders />}
          {direction === 'in' &&
            (pendingToAddressComponent || (
              <IOList
                currentAddress={_addressHash || ''}
                isOut={false}
                outputs={outputs}
                inputs={(tx as Transaction).inputs}
                timestamp={(tx as Transaction).timestamp}
                truncate
              />
            ))}
        </CellAddress>
      )}
      <CellDirection>
        <HiddenLabel text={t`to`} />
        {!hideLeftAddress ? (
          <ArrowRightIcon size={16} strokeWidth={3} />
        ) : (
          <DirectionText>{direction === 'out' ? t`to` : t`from`}</DirectionText>
        )}
      </CellDirection>
      <CellAddress>
        <DirectionalAddress>
          {direction === 'in' && !hideLeftAddress && (
            <AddressBadgeStyled address={address} truncate showHashWhenNoLabel withBorders />
          )}
          {((direction === 'in' && hideLeftAddress) || direction === 'out') &&
            (pendingToAddressComponent || (
              <IOList
                currentAddress={_addressHash || ''}
                isOut={direction === 'out'}
                outputs={outputs}
                inputs={(tx as Transaction).inputs}
                timestamp={(tx as Transaction).timestamp}
                truncate
              />
            ))}
        </DirectionalAddress>
      </CellAddress>
      <CellAmount aria-hidden="true" color={amountTextColor[infoType]}>
        {!!amount && (
          <>
            {lockTime && lockTime > new Date() && <LockStyled unlockAt={lockTime} />}
            <div>
              {infoType === 'out' && '- '}
              {infoType === 'in' && '+ '}
              <Amount value={amount} fadeDecimals color={amountTextColor[infoType]} />
            </div>
          </>
        )}
      </CellAmount>
    </div>
  )
}

export const useTransactionalInfoSettings = () => {
  const theme = useTheme()
  const { t } = useTranslation('App')

  return {
    label: {
      in: t`Received`,
      out: t`Sent`,
      move: t`Moved`,
      pending: t`Pending`
    },
    amountTextColor: {
      in: theme.global.valid,
      out: theme.global.accent,
      move: theme.font.primary,
      pending: theme.font.primary
    },
    iconColor: {
      in: theme.global.valid,
      out: theme.global.accent,
      move: theme.font.secondary,
      pending: theme.font.secondary
    },
    iconBgColor: {
      in: colord(theme.global.valid).alpha(0.11).toRgbString(),
      out: colord(theme.global.accent).alpha(0.11).toRgbString(),
      move: colord(theme.font.secondary).alpha(0.11).toRgbString(),
      pending: colord(theme.font.secondary).alpha(0.11).toRgbString()
    }
  }
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

const CellTime = styled.div`
  display: flex;
  align-items: center;
  margin-right: 28px;
  text-align: left;
`

const TokenTimeInner = styled.div`
  width: 9em;
  color: ${({ theme }) => theme.font.secondary};
`

const CellAddress = styled.div<{ alignRight?: boolean }>`
  min-width: 0;
  max-width: 340px;
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

const CellAmount = styled.div<{ color: string }>`
  flex-grow: 1;
  justify-content: right;
  display: flex;
  min-width: 6em;
  flex-basis: 120px;
  gap: 6px;
  align-items: center;
  color: ${({ color }) => color};
`

const DirectionText = styled.div`
  min-width: 50px;
  display: flex;
  justify-content: flex-end;
`

const CellDirection = styled.div`
  color: ${({ theme }) => theme.font.tertiary};
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

const LockStyled = styled(Lock)`
  color: ${({ theme }) => theme.font.secondary};
`

const CellToken = styled.div`
  flex-grow: 1;
  margin-right: 28px;
`
