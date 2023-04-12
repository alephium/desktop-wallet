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

import { calculateAmountWorth } from '@alephium/sdk'
import { colord } from 'colord'
import dayjs from 'dayjs'
import { chunk } from 'lodash'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import AddressBadge from '@/components/AddressBadge'
import AddressColorIndicator from '@/components/AddressColorIndicator'
import Amount from '@/components/Amount'
import AssetBadge from '@/components/AssetBadge'
import SkeletonLoader from '@/components/SkeletonLoader'
import { useAppSelector } from '@/hooks/redux'
import AddressDetailsModal from '@/modals/AddressDetailsModal'
import ModalPortal from '@/modals/ModalPortal'
import {
  selectAddressByHash,
  selectAddressesAssets,
  selectIsStateUninitialized
} from '@/storage/addresses/addressesSelectors'
import { selectIsLoadingAssetsInfo } from '@/storage/assets/assetsSelectors'
import { useGetPriceQuery } from '@/storage/assets/priceApiSlice'
import { AddressHash } from '@/types/addresses'
import { currencies } from '@/utils/currencies'

interface AddressGridRowProps {
  addressHash: AddressHash
  className?: string
}

const maxDisplayedAssets = 7 // Allow 2 rows by default

const AddressGridRow = ({ addressHash, className }: AddressGridRowProps) => {
  const { t } = useTranslation()
  const address = useAppSelector((state) => selectAddressByHash(state, addressHash))
  const assets = useAppSelector((state) => selectAddressesAssets(state, address?.hash ? [address.hash] : undefined))
  const stateUninitialized = useAppSelector(selectIsStateUninitialized)
  const isLoadingAssetsInfo = useAppSelector(selectIsLoadingAssetsInfo)
  const { data: price, isLoading: isPriceLoading } = useGetPriceQuery(currencies.USD.ticker)

  const [isAddressDetailsModalOpen, setIsAddressDetailsModalOpen] = useState(false)

  const assetsWithBalance = assets.filter((asset) => asset.balance > 0)
  const [displayedAssets, ...hiddenAssetsChunks] = chunk(assetsWithBalance, maxDisplayedAssets)
  const hiddenAssets = hiddenAssetsChunks.flat()

  if (!address) return null

  const fiatBalance = calculateAmountWorth(BigInt(address.balance), price ?? 0)

  return (
    <>
      <GridRow key={address.hash} onClick={() => setIsAddressDetailsModalOpen(true)} className={className}>
        <AddressNameCell>
          <AddressColorIndicator addressHash={address.hash} />
          <Column>
            <Label>
              <AddressBadge addressHash={address.hash} hideColorIndication truncate />
            </Label>
            {stateUninitialized ? (
              <SkeletonLoader height="15.5px" />
            ) : (
              <LastActivity>
                {address.lastUsed ? `${t('Last activity')} ${dayjs(address.lastUsed).fromNow()}` : t('Never used')}
              </LastActivity>
            )}
          </Column>
        </AddressNameCell>
        <Cell>
          {isLoadingAssetsInfo || stateUninitialized ? (
            <SkeletonLoader height="33.5px" />
          ) : (
            <AssetLogos>
              {displayedAssets && displayedAssets.map(({ id }) => <AssetBadge key={id} assetId={id} simple />)}
              {hiddenAssets && hiddenAssets.length > 0 && (
                <span
                  data-tooltip-id="default"
                  data-tooltip-content={hiddenAssets.map(({ symbol }) => symbol || t('Unknown token')).join(', ')}
                >
                  +{hiddenAssets.length}
                </span>
              )}
            </AssetLogos>
          )}
        </Cell>
        <AmountCell>
          {stateUninitialized ? <SkeletonLoader height="18.5px" /> : <Amount value={BigInt(address.balance)} />}
        </AmountCell>
        <FiatAmountCell>
          {stateUninitialized || isPriceLoading ? (
            <SkeletonLoader height="18.5px" />
          ) : (
            <Amount value={fiatBalance} isFiat suffix={currencies.USD.symbol} />
          )}
        </FiatAmountCell>
      </GridRow>
      <ModalPortal>
        {isAddressDetailsModalOpen && (
          <AddressDetailsModal addressHash={address.hash} onClose={() => setIsAddressDetailsModalOpen(false)} />
        )}
      </ModalPortal>
    </>
  )
}

export default AddressGridRow

const Column = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-width: 0;
`

const Label = styled.div`
  font-size: 16px;
  font-weight: var(--fontWeight-semiBold);
  display: flex;
`

const LastActivity = styled.div`
  color: ${({ theme }) => theme.font.tertiary};
`

const Cell = styled.div`
  padding: 15px 20px;
  align-items: center;
  display: flex;
  background-color: ${({ theme }) => theme.bg.primary};
  transition: background-color 0.2s ease-out;
`

const GridRow = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1px;

  &:hover ${Cell} {
    cursor: pointer;
    background-color: ${({ theme }) => colord(theme.bg.primary).alpha(0.7).toRgbString()};
  }
`

const AmountCell = styled(Cell)`
  text-align: right;
  font-weight: var(--fontWeight-semiBold);
  font-size: 15px;
  color: ${({ theme }) => theme.font.secondary};
  justify-content: flex-end;
`

const FiatAmountCell = styled(AmountCell)`
  color: ${({ theme }) => theme.bg.contrast};
`

const AddressNameCell = styled(Cell)`
  gap: 15px;
  cursor: pointer;
`

const AssetLogos = styled.div`
  padding: 8px 16px;
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  align-items: center;
`
