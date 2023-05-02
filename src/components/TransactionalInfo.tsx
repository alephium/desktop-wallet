/*
Copyright 2018 - 2023 The Alephium Authors
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

import { formatAmountForDisplay } from '@alephium/sdk'
import { Transaction } from '@alephium/sdk/api/explorer'
import { colord } from 'colord'
import { partition } from 'lodash'
import { ArrowLeftRight, ArrowRight as ArrowRightIcon } from 'lucide-react'
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
import { useTransactionUI } from '@/hooks/useTransactionUI'
import { selectAddressByHash } from '@/storage/addresses/addressesSelectors'
import { deviceBreakPoints } from '@/style/globalStyles'
import { AddressHash } from '@/types/addresses'
import { AddressTransaction } from '@/types/transactions'
import { getTransactionInfo, isPendingTx } from '@/utils/transactions'

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
  const { assets, direction, outputs, lockTime, infoType } = getTransactionInfo(tx, showInternalInflows)
  const { label, Icon, iconColor, iconBgColor } = useTransactionUI(infoType)

  const isMoved = infoType === 'move'
  const isPending = isPendingTx(tx)

  if (!address) return null

  const pendingDestinationAddress = isPending ? (
    tx.type === 'contract' ? (
      <Badge>{t('Smart contract')}</Badge>
    ) : (
      <AddressBadge truncate addressHash={tx.toAddress} />
    )
  ) : null

  const [knownAssets, unknownAssets] = partition(assets, (asset) => !!asset.symbol)

  return (
    <div className={className}>
      <CellTime>
        <CellArrow>
          <TransactionIcon color={iconBgColor}>
            <Icon size={15} strokeWidth={2} color={iconColor} />
          </TransactionIcon>
        </CellArrow>
        <DirectionAndTime>
          <DirectionLabel>{label}</DirectionLabel>
          {knownAssets.map(({ id, amount, decimals, symbol }) => (
            <HiddenLabel key={id} text={`${formatAmountForDisplay({ amount, amountDecimals: decimals })} ${symbol}`} />
          ))}
          {unknownAssets.length > 0 && <HiddenLabel text={` + ${unknownAssets} ${t('Unknown tokens')}`} />}
          <AssetTime>
            <TimeSince timestamp={tx.timestamp} faded />
          </AssetTime>
        </DirectionAndTime>
      </CellTime>
      <CellAssetBadges compact={compact}>
        <AssetBadges>
          {assets.map(({ id }) => (
            <AssetBadge assetId={id} simple key={id} />
          ))}
        </AssetBadges>
      </CellAssetBadges>
      {!showInternalInflows && (
        <CellAddress alignRight>
          <HiddenLabel text={direction === 'swap' ? t('between') : t('from')} />
          {(direction === 'out' || direction === 'swap') && (
            <AddressBadgeStyled addressHash={addressHash} truncate disableA11y withBorders />
          )}
          {direction === 'in' && (
            <IOList
              currentAddress={addressHash}
              isOut={false}
              outputs={outputs}
              inputs={(tx as Transaction).inputs}
              timestamp={(tx as Transaction).timestamp}
              truncate
              disableA11y
            />
          )}
        </CellAddress>
      )}
      <CellDirection>
        <HiddenLabel text={direction === 'swap' ? t('and') : t('to')} />
        {!showInternalInflows ? (
          direction === 'swap' ? (
            <ArrowLeftRight size={15} strokeWidth={2} />
          ) : (
            <ArrowRightIcon size={15} strokeWidth={2} />
          )
        ) : (
          <DirectionText>
            {
              {
                in: t('from'),
                out: t('to'),
                swap: t('with')
              }[direction]
            }
          </DirectionText>
        )}
      </CellDirection>
      <CellAddress>
        <DirectionalAddress>
          {direction === 'in' && !showInternalInflows && (
            <AddressBadge addressHash={addressHash} truncate disableA11y withBorders />
          )}
          {((direction === 'in' && showInternalInflows) || direction === 'out' || direction === 'swap') &&
            (pendingDestinationAddress || (
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
      <TableCellAmount aria-hidden="true">
        {knownAssets.map(({ id, amount, decimals, symbol }) => (
          <AmountContainer key={id}>
            {lockTime && lockTime > new Date() && <LockStyled unlockAt={lockTime} />}
            <Amount value={amount} decimals={decimals} suffix={symbol} highlight={!isMoved} showPlusMinus={!isMoved} />
          </AmountContainer>
        ))}
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
  margin-right: 20px;
`

const CellTime = styled.div`
  display: flex;
  align-items: center;
  margin-right: 28px;
  text-align: left;
  width: 25%;
`

const DirectionAndTime = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
`

const DirectionLabel = styled.span`
  color: ${({ theme }) => theme.font.primary};
  font-weight: var(--fontWeight-medium);
  font-size: 14px;
`

const AssetTime = styled.div`
  font-size: 12px;
`

const CellAddress = styled.div<{ alignRight?: boolean }>`
  min-width: 0;
  max-width: 120px;
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

const CellAssetBadges = styled.div<Pick<TransactionalInfoProps, 'compact'>>`
  flex-grow: 1;
  flex-shrink: 0;
  width: ${({ compact }) => (compact ? '80px' : '180px')};

  @media ${deviceBreakPoints.desktop} {
    width: 80px;
  }
`

const TransactionIcon = styled.span<{ color?: string }>`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 30px;
  height: 30px;
  border-radius: 30px;
  background-color: ${({ color, theme }) => color || theme.font.primary};
  border: 1px solid
    ${({ color, theme }) =>
      colord(color || theme.font.primary)
        .alpha(0.15)
        .toHex()};
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
  align-items: center;
`
