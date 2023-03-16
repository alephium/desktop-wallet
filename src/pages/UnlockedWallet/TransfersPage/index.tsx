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
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import AddressBadge from '@/components/AddressBadge'
import Amount from '@/components/Amount'
import MultiSelect, { handleAllButtonClick, handleOptionClick, renderOption } from '@/components/Inputs/MultiSelect'
import SelectOptionItemContent from '@/components/Inputs/SelectOptionItemContent'
import TransactionList from '@/components/TransactionList'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { UnlockedWalletPanel } from '@/pages/UnlockedWallet/UnlockedWalletLayout'
import UnlockedWalletPage from '@/pages/UnlockedWallet/UnlockedWalletPage'
import { selectAllAddresses } from '@/storage/addresses/addressesSelectors'
import { transfersPageInfoMessageClosed } from '@/storage/global/globalActions'
import { Address } from '@/types/addresses'
import { links } from '@/utils/links'
import { removeItemFromArray } from '@/utils/misc'
import { directionOptions } from '@/utils/transactions'

const TransfersPage = () => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const infoMessageClosed = useAppSelector((s) => s.global.transfersPageInfoMessageClosed)
  const addresses = useAppSelector(selectAllAddresses)

  const [selectedAddresses, setSelectedAddresses] = useState(addresses)
  const [selectedDirections, setSelectedDirections] = useState(directionOptions)

  const closeInfoMessage = () => dispatch(transfersPageInfoMessageClosed())

  const handleAddressOptionClick = (selectedAddress: Address) => {
    const index = selectedAddresses.findIndex((address) => address.hash === selectedAddress.hash)

    index !== -1
      ? setSelectedAddresses(removeItemFromArray(selectedAddresses, index))
      : setSelectedAddresses([selectedAddress, ...selectedAddresses])
  }

  const renderAddressesSelectedValue = () =>
    selectedAddresses.length === 0
      ? ''
      : selectedAddresses.length === 1
      ? selectedAddresses[0].hash
      : selectedAddresses.length === addresses.length
      ? t('All selected')
      : t('{{ number }} selected', { number: selectedAddresses.length })

  const renderDirectionsSelectedValue = () =>
    selectedDirections.length === 0
      ? ''
      : selectedDirections.length === directionOptions.length
      ? 'All selected'
      : map(selectedDirections, 'label').join(', ')

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
        <Tile>
          <MultiSelect
            label={t('Addresses')}
            modalTitle={t('Select addresses')}
            options={addresses}
            selectedOptions={selectedAddresses}
            onOptionClick={handleAddressOptionClick}
            onAllButtonClick={() => handleAllButtonClick(selectedAddresses, addresses, setSelectedAddresses)}
            renderSelectedValue={renderAddressesSelectedValue}
            getOptionKey={(address) => address.hash}
            getOptionA11YText={(address) => address.label || address.hash}
            isOptionSelected={(option) => selectedAddresses.some((address) => option.hash === address.hash)}
            renderOption={(address: Address) => (
              <SelectOptionItemContent
                ContentLeft={<AddressBadgeStyled addressHash={address.hash} showHashWhenNoLabel disableA11y />}
                ContentRight={<AmountStyled value={BigInt(address.balance)} fadeDecimals />}
              />
            )}
          />
        </Tile>
        <Tile>
          <MultiSelect
            label={t('Directions')}
            modalTitle={t('Select directions')}
            options={directionOptions}
            selectedOptions={selectedDirections}
            onOptionClick={(option) => handleOptionClick(option, selectedDirections, setSelectedDirections)}
            onAllButtonClick={() => handleAllButtonClick(selectedDirections, directionOptions, setSelectedDirections)}
            renderSelectedValue={renderDirectionsSelectedValue}
            getOptionKey={(direction) => direction.value.toString()}
            getOptionA11YText={(direction) => direction.label}
            isOptionSelected={(option) => selectedDirections.some((direction) => option.value === direction.value)}
            renderOption={renderOption}
          />
        </Tile>
      </Filters>
      <UnlockedWalletPanel top>
        <TransactionList
          addressHashes={map(selectedAddresses, 'hash')}
          directions={map(selectedDirections, 'value')}
          hideHeader
        />
      </UnlockedWalletPanel>
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
`

const FilterTile = styled.div`
  padding: 10px;
  border-right: 1px solid ${({ theme }) => theme.border.secondary};
`

const Tile = styled(FilterTile)`
  width: 200px;
`

const AmountStyled = styled(Amount)`
  flex: 1;
  font-weight: var(--fontWeight-semiBold);
`

const AddressBadgeStyled = styled(AddressBadge)`
  width: auto;
`
