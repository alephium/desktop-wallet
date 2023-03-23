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

import { map } from 'lodash'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import Button from '@/components/Button'
import ShortcutButtons from '@/components/Buttons/ShortcutButtons'
import MultiSelect from '@/components/Inputs/MultiSelect'
import SelectOptionAddress from '@/components/SelectOptionAddress'
import SelectOptionAsset from '@/components/SelectOptionAsset'
import TransactionList from '@/components/TransactionList'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import ModalPortal from '@/modals/ModalPortal'
import ReceiveModal from '@/modals/ReceiveModal'
import SendModalTransfer from '@/modals/SendModals/SendModalTransfer'
import { UnlockedWalletPanel } from '@/pages/UnlockedWallet/UnlockedWalletLayout'
import UnlockedWalletPage from '@/pages/UnlockedWallet/UnlockedWalletPage'
import { selectAddressesAssets, selectAllAddresses } from '@/storage/addresses/addressesSelectors'
import { selectIsLoadingAssetsInfo } from '@/storage/assets/assetsSelectors'
import { transfersPageInfoMessageClosed } from '@/storage/global/globalActions'
import { appHeaderHeightPx } from '@/style/globalStyles'
import { Address } from '@/types/addresses'
import { links } from '@/utils/links'
import { directionOptions } from '@/utils/transactions'

const TransfersPage = () => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()

  const infoMessageClosed = useAppSelector((s) => s.global.transfersPageInfoMessageClosed)
  const addresses = useAppSelector(selectAllAddresses)
  const assets = useAppSelector(selectAddressesAssets)
  const isLoadingAssetsInfo = useAppSelector(selectIsLoadingAssetsInfo)

  const [selectedAddresses, setSelectedAddresses] = useState(addresses)
  const [selectedDirections, setSelectedDirections] = useState(directionOptions)
  const [selectedAssets, setSelectedAssets] = useState(assets)
  const [isSendModalOpen, setIsSendModalOpen] = useState(false)
  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false)

  useEffect(() => {
    if (!isLoadingAssetsInfo) setSelectedAssets(assets)
  }, [assets, isLoadingAssetsInfo])

  const closeInfoMessage = () => dispatch(transfersPageInfoMessageClosed())

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
      ? 'All selected'
      : map(selectedDirections, 'label').join(', ')

  const renderAssetsSelectedValue = () =>
    selectedAssets.length === 0
      ? ''
      : selectedAssets.length === assets.length
      ? 'All selected'
      : selectedAssets.map((asset) => asset.symbol ?? asset.id).join(', ')

  const resetFilters = () => {
    setSelectedAddresses(addresses)
    setSelectedDirections(directionOptions)
    setSelectedAssets(assets)
  }

  return (
    <UnlockedWalletPage
      title={t('Transfers')}
      subtitle={t('Browse and download your transaction history. Execute new transfers easily.')}
      isInfoMessageVisible={!infoMessageClosed}
      closeInfoMessage={closeInfoMessage}
      infoMessageLink={links.faq}
      infoMessage={t('You have questions about transfers ? Click here!')}
    >
      <Filters>
        <FilterTiles>
          <Tile>
            <MultiSelect
              label={t('Addresses')}
              modalTitle={t('Select addresses')}
              options={addresses}
              selectedOptions={selectedAddresses}
              selectedOptionsSetter={setSelectedAddresses}
              renderSelectedValue={renderAddressesSelectedValue}
              getOptionKey={(address) => address.hash}
              getOptionText={(address) => address.label || address.hash}
              renderOption={(address: Address) => <SelectOptionAddress address={address} />}
            />
          </Tile>
          <Tile>
            <MultiSelect
              label={t('Assets')}
              modalTitle={t('Select assets')}
              options={assets}
              selectedOptions={selectedAssets}
              selectedOptionsSetter={setSelectedAssets}
              renderSelectedValue={renderAssetsSelectedValue}
              getOptionKey={(asset) => asset.id}
              getOptionText={(asset) => asset.name ?? asset.symbol ?? asset.id}
              renderOption={(asset) => <SelectOptionAsset asset={asset} />}
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
              getOptionKey={(direction) => direction.value.toString()}
              getOptionText={(direction) => direction.label}
            />
          </Tile>
        </FilterTiles>
        <Buttons>
          <Button role="secondary" short onClick={resetFilters}>
            {t('Reset filters')}
          </Button>
        </Buttons>
      </Filters>
      <UnlockedWalletPanel top>
        <TransactionList
          addressHashes={map(selectedAddresses, 'hash')}
          directions={map(selectedDirections, 'value')}
          assetIds={map(selectedAssets, 'id')}
          hideHeader
        />
      </UnlockedWalletPanel>
      <CornerButtons>
        <ButtonsGrid>
          <ShortcutButtons receive send highlight />
        </ButtonsGrid>
      </CornerButtons>
      <ModalPortal>
        {isSendModalOpen && <SendModalTransfer onClose={() => setIsSendModalOpen(false)} />}
        {isReceiveModalOpen && <ReceiveModal onClose={() => setIsReceiveModalOpen(false)} />}
      </ModalPortal>
    </UnlockedWalletPage>
  )
}

export default TransfersPage

const Filters = styled(UnlockedWalletPanel)`
  background-color: ${({ theme }) => theme.bg.tertiary};
  border-top: 1px solid;
  border-bottom: 1px solid;
  border-color: ${({ theme }) => theme.border.secondary};
  padding-bottom: 0;
  display: flex;
  position: sticky;
  justify-content: space-between;
  top: ${appHeaderHeightPx}px;
  z-index: 1;
`

const FilterTiles = styled.div`
  display: flex;
  min-width: 0;
  flex: 1;
`

const FilterTile = styled.div`
  padding: 10px;
  border-right: 1px solid ${({ theme }) => theme.border.secondary};
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

const CornerButtons = styled.div`
  position: fixed;
  bottom: 26px;
  right: 22px;
  border-radius: 47px;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.border.primary};
  box-shadow: ${({ theme }) => theme.shadow.primary};
  background-color: ${({ theme }) => theme.bg.background2};
`

const ButtonsGrid = styled.div`
  background-color: ${({ theme }) => theme.border.secondary};
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1px;
`
