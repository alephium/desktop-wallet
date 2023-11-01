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

import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { SelectOption, SelectOptionsModal } from '@/components/Inputs/Select'
import SelectOptionAddress from '@/components/Inputs/SelectOptionAddress'
import { useAppSelector } from '@/hooks/redux'
import { Address, AddressHash } from '@/types/addresses'
import { addressHasAssets, filterAddresses, filterAddressesWithoutAssets } from '@/utils/addresses'

interface AddressSelectModalProps {
  title: string
  options: Address[]
  selectedAddress?: Address
  onAddressSelect: (address: Address) => void
  onClose: () => void
  emptyListPlaceholder?: string
  hideAddressesWithoutAssets?: boolean
}

const AddressSelectModal = ({
  title,
  options,
  onAddressSelect,
  onClose,
  selectedAddress,
  emptyListPlaceholder,
  hideAddressesWithoutAssets
}: AddressSelectModalProps) => {
  const { t } = useTranslation()
  const assetsInfo = useAppSelector((state) => state.assetsInfo.entities)

  const addresses = hideAddressesWithoutAssets ? filterAddressesWithoutAssets(options) : options
  const [filteredAddresses, setFilteredAddresses] = useState(addresses)
  const defaultAddressHasAssets = selectedAddress && addressHasAssets(selectedAddress)

  let initialAddress = selectedAddress
  if (hideAddressesWithoutAssets) {
    if (!defaultAddressHasAssets && addresses.length > 0) {
      initialAddress = addresses[0]
    }
  } else if (!initialAddress && addresses.length > 0) {
    initialAddress = addresses[0]
  }

  const [address, setAddress] = useState(initialAddress)

  const addressSelectOptions: SelectOption<AddressHash>[] = addresses.map((address) => ({
    value: address.hash,
    label: address.label ?? address.hash
  }))

  const selectAddress = (option: SelectOption<AddressHash>) => {
    const selectedAddress = addresses.find((address) => address.hash === option.value)
    selectedAddress && setAddress(selectedAddress)
    selectedAddress && onAddressSelect(selectedAddress)
  }

  const handleSearch = (searchInput: string) =>
    setFilteredAddresses(filterAddresses(addresses, searchInput.toLowerCase(), assetsInfo))

  return (
    <SelectOptionsModal
      title={title}
      options={addressSelectOptions}
      selectedOption={addressSelectOptions.find((a) => a.value === address?.hash)}
      showOnly={filteredAddresses.map((address) => address.hash)}
      setValue={selectAddress}
      onClose={onClose}
      onSearchInput={handleSearch}
      searchPlaceholder={t('Search for name or a hash...')}
      optionRender={(option, isSelected) => {
        const address = addresses.find((address) => address.hash === option.value)
        if (address) return <SelectOptionAddress address={address} isSelected={isSelected} />
      }}
      emptyListPlaceholder={
        emptyListPlaceholder ||
        (hideAddressesWithoutAssets
          ? t(
              'There are no addresses with available balance. Please, send some funds to one of your addresses, and try again.'
            )
          : t('There are no available addresses.'))
      }
    />
  )
}

export default AddressSelectModal
