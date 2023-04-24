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
import { colord } from 'colord'
import { useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import Button from '@/components/Button'
import MultiSelect from '@/components/Inputs/MultiSelect'
import SelectOptionAddress from '@/components/Inputs/SelectOptionAddress'
import SelectOptionAsset from '@/components/Inputs/SelectOptionAsset'
import { useAppSelector } from '@/hooks/redux'
import { UnlockedWalletPanel } from '@/pages/UnlockedWallet/UnlockedWalletLayout'
import { makeSelectAddressesAssets, selectAllAddresses } from '@/storage/addresses/addressesSelectors'
import { selectIsLoadingAssetsInfo } from '@/storage/assets/assetsSelectors'
import { appHeaderHeightPx } from '@/style/globalStyles'
import { Address } from '@/types/addresses'
import { Asset } from '@/types/assets'
import { directionOptions } from '@/utils/transactions'

interface FiltersPanelProps {
  selectedAddresses: Address[]
  setSelectedAddresses: (addresses: Address[]) => void
  selectedDirections: typeof directionOptions
  setSelectedDirections: (directions: typeof directionOptions) => void
  selectedAssets?: Asset[]
  setSelectedAssets: (assets: Asset[]) => void
  className?: string
}

const FiltersPanel = ({
  selectedAddresses,
  setSelectedAddresses,
  selectedDirections,
  setSelectedDirections,
  selectedAssets,
  setSelectedAssets,
  className
}: FiltersPanelProps) => {
  const { t } = useTranslation()
  const addresses = useAppSelector(selectAllAddresses)
  const selectAddressesAssets = useMemo(makeSelectAddressesAssets, [])
  const assets = useAppSelector(selectAddressesAssets)

  const isLoadingAssetsInfo = useAppSelector(selectIsLoadingAssetsInfo)
  const stateUninitialized = useAppSelector((s) => s.addresses.status === 'uninitialized') // TODO: Use selector from next PR

  const renderAddressesSelectedValue = () =>
    selectedAddresses.length === 0
      ? ''
      : selectedAddresses.length === 1
      ? selectedAddresses[0].label || selectedAddresses[0].hash
      : selectedAddresses.length === addresses.length
      ? t('All selected')
      : t('{{ number }} selected', { number: selectedAddresses.length })

  const renderDirectionsSelectedValue = () =>
    selectedDirections.length === 0
      ? ''
      : selectedDirections.length === directionOptions.length
      ? t('All selected')
      : selectedDirections.map((direction) => t(direction.label)).join(', ')

  const renderAssetsSelectedValue = () =>
    !selectedAssets
      ? null
      : selectedAssets.length === 0
      ? ''
      : selectedAssets.length === assets.length
      ? t('All selected')
      : selectedAssets.map((asset) => asset.symbol ?? asset.id).join(', ')

  const resetFilters = () => {
    setSelectedAddresses(addresses)
    setSelectedDirections(directionOptions)
    setSelectedAssets(assets)
  }

  useEffect(() => {
    if (!isLoadingAssetsInfo && !stateUninitialized && !selectedAssets) {
      setSelectedAssets(assets)
    }
  }, [assets, isLoadingAssetsInfo, selectedAssets, setSelectedAssets, stateUninitialized])

  return (
    <UnlockedWalletPanel className={className}>
      <FilterTiles>
        <Tile>
          <MultiSelect
            label={t('Addresses')}
            modalTitle={t('Select addresses')}
            options={addresses}
            selectedOptions={selectedAddresses}
            selectedOptionsSetter={setSelectedAddresses}
            renderSelectedValue={renderAddressesSelectedValue}
            getOptionId={(address) => address.hash}
            getOptionText={(address) => address.label || address.hash}
            renderOption={(address: Address) => <SelectOptionAddress address={address} />}
          />
        </Tile>
        <Tile>
          <MultiSelect
            label={t('Assets')}
            modalTitle={t('Select assets')}
            options={assets}
            selectedOptions={selectedAssets ?? []}
            selectedOptionsSetter={setSelectedAssets}
            renderSelectedValue={renderAssetsSelectedValue}
            getOptionId={(asset) => asset.id}
            getOptionText={(asset) => asset.name ?? asset.symbol ?? asset.id}
            renderOption={(asset) => <SelectOptionAsset asset={asset} hideAmount />}
          />
        </Tile>
        <Tile>
          <MultiSelect
            label={t('Directions')}
            modalTitle={t('Select directions')}
            options={directionOptions}
            selectedOptions={selectedDirections}
            selectedOptionsSetter={setSelectedDirections}
            renderSelectedValue={renderDirectionsSelectedValue}
            getOptionId={(direction) => direction.value.toString()}
            getOptionText={(direction) => t(direction.label)}
          />
        </Tile>
      </FilterTiles>
      <Buttons>
        <Button role="secondary" short onClick={resetFilters}>
          {t('Reset filters')}
        </Button>
      </Buttons>
    </UnlockedWalletPanel>
  )
}

export default styled(FiltersPanel)`
  border-top: 1px solid;
  border-bottom: 1px solid;
  border-color: ${({ theme }) => theme.border.primary};
  display: flex;
  position: sticky;
  justify-content: space-between;
  top: ${appHeaderHeightPx}px;
  z-index: 1;
  background-color: ${({ theme }) => colord(theme.bg.secondary).alpha(0.9).toHex()};
  backdrop-filter: blur(10px);
`

const FilterTiles = styled.div`
  display: flex;
  min-width: 0;
  flex: 1;
`

const FilterTile = styled.div`
  padding: 10px;
  border-right: 1px solid ${({ theme }) => theme.border.primary};
`

const Tile = styled(FilterTile)`
  min-width: 200px;
  flex: 1;
`

const Buttons = styled.div`
  display: flex;
  align-items: center;
  padding-left: 48px;
  flex-shrink: 0;
`
