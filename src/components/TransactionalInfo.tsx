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

import { formatAmountForDisplay, isConsolidationTx } from '@alephium/sdk'
import { Transaction } from '@alephium/sdk/api/explorer'
import { ArrowRight as ArrowRightIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import styled, { css } from 'styled-components'

import Badge from '@/components/Badge'
import { useAppSelector } from '@/hooks/redux'
import { useTransactionInfo } from '@/hooks/useTransactionInfo'
import { useTransactionUI } from '@/hooks/useTransactionUI'
import { selectAddressByHash } from '@/storage/app-state/slices/addressesSlice'
import { AddressHash } from '@/types/addresses'
import { AddressTransaction } from '@/types/transactions'
import { isPendingTx } from '@/utils/transactions'

import AddressBadge from './AddressBadge'
import Amount from './Amount'
import HiddenLabel from './HiddenLabel'
import IOList from './IOList'
import Lock from './Lock'
import TimeSince from './TimeSince'
import Token from './Token'

const token = 'alph'

interface TransactionalInfoProps {
  transaction: AddressTransaction
  addressHash?: AddressHash
  showInternalInflows?: boolean
  className?: string
}

const TransactionalInfo = ({
  transaction: tx,
  addressHash: addressHashProp,
  className,
  showInternalInflows
}: TransactionalInfoProps) => {
  const { t } = useTranslation()
  const { addressHash: addressHashParam = '' } = useParams<{ addressHash: AddressHash }>()
  const addressHash = addressHashProp ?? addressHashParam
  const address = useAppSelector((state) => selectAddressByHash(state, addressHash))
  const { amount, direction, outputs, lockTime, infoType } = useTransactionInfo(tx, addressHash, showInternalInflows)
  const { label, amountTextColor, amountSign: sign, Icon, iconColor, iconBgColor } = useTransactionUI(infoType)
  const isPending = isPendingTx(tx)

  if (!address) return null

  const pendingToAddressComponent = isPending ? (
    tx.type === 'contract' ? (
      <Badge>{t('Smart contract')}</Badge>
    ) : (
      <AddressBadge truncate addressHash={tx.toAddress} showHashWhenNoLabel withBorders />
    )
  ) : null

  const amountSign = showInternalInflows && infoType === 'move' && !isPending && !isConsolidationTx(tx) ? '- ' : sign

  return (
    <div className={className}>
      <CellTime>
        <CellArrow>
          <TransactionIcon color={iconBgColor}>
            <Icon size={16} strokeWidth={3} color={iconColor} />
          </TransactionIcon>
        </CellArrow>
        <TokenTimeInner>
          {label}
          <HiddenLabel text={`${formatAmountForDisplay(BigInt(amount ?? 0))} ${token}`} />
          <TimeSince timestamp={tx.timestamp} faded />
        </TokenTimeInner>
      </CellTime>
      <CellToken>
        <TokenStyled type={token} disableA11y />
      </CellToken>
      {!showInternalInflows && (
        <CellAddress alignRight>
          <HiddenLabel text={t`from`} />
          {direction === 'out' && (
            <AddressBadgeStyled addressHash={addressHash} truncate showHashWhenNoLabel withBorders disableA11y />
          )}
          {direction === 'in' &&
            (pendingToAddressComponent || (
              <IOList
                currentAddress={addressHash}
                isOut={false}
                outputs={outputs}
                inputs={(tx as Transaction).inputs}
                timestamp={(tx as Transaction).timestamp}
                truncate
                disableA11y
              />
            ))}
        </CellAddress>
      )}
      <CellDirection>
        <HiddenLabel text={t`to`} />
        {!showInternalInflows ? (
          <ArrowRightIcon size={16} strokeWidth={3} />
        ) : (
          <DirectionText>{direction === 'out' ? t`to` : t`from`}</DirectionText>
        )}
      </CellDirection>
      <CellAddress>
        <DirectionalAddress>
          {direction === 'in' && !showInternalInflows && (
            <AddressBadgeStyled addressHash={addressHash} truncate showHashWhenNoLabel withBorders disableA11y />
          )}
          {((direction === 'in' && showInternalInflows) || direction === 'out') &&
            (pendingToAddressComponent || (
              <IOList
                currentAddress={addressHash}
                isOut={direction === 'out'}
                outputs={outputs}
                inputs={(tx as Transaction).inputs}
                timestamp={(tx as Transaction).timestamp}
                truncate
                disableA11y
              />
            ))}
        </DirectionalAddress>
      </CellAddress>
      <CellAmount aria-hidden="true" color={amountTextColor}>
        {amount !== undefined && (
          <>
            {lockTime && lockTime > new Date() && <LockStyled unlockAt={lockTime} />}
            <div>
              {amountSign}
              <Amount value={amount} fadeDecimals color={amountTextColor} />
            </div>
          </>
        )}
      </CellAmount>
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

const CellTime = styled.div`
  display: flex;
  align-items: center;
  margin-right: 28px;
  text-align: left;
`

const TokenTimeInner = styled.div`
  width: 11em;
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

const TransactionIcon = styled.span<{ color?: string }>`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 25px;
  height: 25px;
  border-radius: 25px;
  background-color: ${({ color, theme }) => color || theme.font.primary};
`
