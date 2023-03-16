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
import MultiSelect from '@/components/Inputs/MultiSelect'
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

const TransfersPage = () => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const infoMessageClosed = useAppSelector((s) => s.global.transfersPageInfoMessageClosed)
  const addresses = useAppSelector(selectAllAddresses)

  const [selectedAddresses, setSelectedAddresses] = useState(addresses)

  const closeInfoMessage = () => dispatch(transfersPageInfoMessageClosed())

  const handleOptionSelect = (selectedAddress: Address) => {
    const index = selectedAddresses.findIndex((address) => address.hash === selectedAddress.hash)

    if (index !== -1) {
      setSelectedAddresses(removeItemFromArray(selectedAddresses, index))
    } else {
      setSelectedAddresses([selectedAddress, ...selectedAddresses])
    }
  }

  const handleAllButtonClick = () =>
    selectedAddresses.length === addresses.length ? setSelectedAddresses([]) : setSelectedAddresses(addresses)

  const renderSelectedValue = () =>
    selectedAddresses.length === 0
      ? ''
      : selectedAddresses.length === 1
      ? selectedAddresses[0].hash
      : selectedAddresses.length === addresses.length
      ? t('All selected')
      : t('{{ number }} selected', { number: selectedAddresses.length })

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
        <AddressesTile>
          <MultiSelect
            label={t('Addresses')}
            modalTitle={t('Select addresses')}
            options={addresses}
            selectedOptions={selectedAddresses}
            onOptionClick={handleOptionSelect}
            onAllButtonClick={handleAllButtonClick}
            renderSelectedValue={renderSelectedValue}
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
        </AddressesTile>
      </Filters>
      <UnlockedWalletPanel top>
        <TransactionList addressHashes={map(selectedAddresses, 'hash')} hideHeader />
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

const AddressesTile = styled(FilterTile)`
  width: 200px;
`

const AmountStyled = styled(Amount)`
  flex: 1;
  font-weight: var(--fontWeight-semiBold);
`

const AddressBadgeStyled = styled(AddressBadge)`
  width: auto;
`
