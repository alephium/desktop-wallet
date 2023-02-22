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

import AddressBadge from '@/components/AddressBadge'
import Amount from '@/components/Amount'
import AssetBadge from '@/components/AssetBadge'
import Badge from '@/components/Badge'
import HiddenLabel from '@/components/HiddenLabel'
import IOList from '@/components/IOList'
import Lock from '@/components/Lock'
import TableCellAmount from '@/components/TableCellAmount'
import TimeSince from '@/components/TimeSince'
import { useAppSelector } from '@/hooks/redux'
import { useTransactionInfo } from '@/hooks/useTransactionInfo'
import { useTransactionUI } from '@/hooks/useTransactionUI'
import { selectAddressByHash } from '@/storage/app-state/slices/addressesSlice'
import { AddressHash } from '@/types/addresses'
import { AddressTransaction } from '@/types/transactions'
import { ALPH } from '@/utils/constants'
import { isPendingTx } from '@/utils/transactions'

interface TransactionalInfoProps {
  transaction: AddressTransaction
  addressHash?: AddressHash
  showInternalInflows?: boolean
  compact?: boolean
  className?: string
}

const TransactionalInfo = ({
  transaction: tx,
  addressHash: addressHashProp,
  className,
  showInternalInflows,
  compact
}: TransactionalInfoProps) => {
  const { t } = useTranslation()
  const { addressHash: addressHashParam = '' } = useParams<{ addressHash: AddressHash }>()
  const addressHash = addressHashProp ?? addressHashParam
  const address = useAppSelector((state) => selectAddressByHash(state, addressHash))
  const tokens = useAppSelector((state) => state.tokens.entities)
  const { amounts, direction, outputs, lockTime, infoType } = useTransactionInfo(tx, addressHash, showInternalInflows)
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

  // TODO: Update display to include tokens

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
          <HiddenLabel text={`${formatAmountForDisplay({ amount: BigInt(amounts.alph ?? 0) })} ALPH`} />
          {amounts.tokens.map((token) => {
            const tokenInfo = tokens[token.id]

            return (
              <HiddenLabel
                text={`${formatAmountForDisplay({ amount: token.amount, amountDecimals: tokenInfo?.decimals })} ${
                  tokenInfo?.symbol
                }`}
                key={token.id}
              />
            )
          })}
          <TimeSince timestamp={tx.timestamp} faded />
        </TokenTimeInner>
      </CellTime>
      <CellToken compact={compact}>
        <AssetBadges>
          <AssetBadge assetId={ALPH.id} />
          {amounts.tokens.map((token) => (
            <AssetBadge assetId={token.id} key={token.id} />
          ))}
        </AssetBadges>
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
      <TableCellAmount aria-hidden="true" color={amountTextColor}>
        {amounts.alph !== undefined && (
          <AmountContainer>
            {lockTime && lockTime > new Date() && <LockStyled unlockAt={lockTime} />}
            <div>
              {amountSign}
              <Amount value={amounts.alph} fadeDecimals color={amountTextColor} />
            </div>
          </AmountContainer>
        )}
        {amounts.tokens.map((token) => {
          const tokenInfo = tokens[token.id]

          return (
            <AmountContainer key={token.id}>
              {lockTime && lockTime > new Date() && <LockStyled unlockAt={lockTime} />}
              <div>
                {amountSign}
                <Amount
                  value={token.amount}
                  fadeDecimals
                  color={amountTextColor}
                  decimals={tokenInfo?.decimals}
                  suffix={tokenInfo?.symbol}
                />
              </div>
            </AmountContainer>
          )
        })}
      </TableCellAmount>
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

const CellToken = styled.div<Pick<TransactionalInfoProps, 'compact'>>`
  flex-grow: 1;
  flex-shrink: 0;
  margin-right: 28px;
  width: ${({ compact }) => (compact ? '80px' : '180px')};
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

const AmountContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`

const AssetBadges = styled.div`
  display: flex;
  gap: 20px;
  row-gap: 10px;
  flex-wrap: wrap;
`
