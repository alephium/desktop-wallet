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

import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import AddressBadge from '@/components/AddressBadge'
import Button from '@/components/Button'
import Select, { SelectOption } from '@/components/Inputs/Select'
import { useAppSelector } from '@/hooks/redux'
import { selectAllAddresses, selectDefaultAddress } from '@/storage/addresses/addressesSelectors'
import { changeDefaultAddress } from '@/storage/addresses/addressesStorageUtils'
import { AddressHash } from '@/types/addresses'

interface AddressOption {
  label: string
  value: AddressHash
}

const DefaultAddressSwitch = () => {
  const { t } = useTranslation()
  const addresses = useAppSelector(selectAllAddresses)
  const defaultAddress = useAppSelector(selectDefaultAddress)

  const addressOptions: AddressOption[] = addresses.map((address) => ({
    label: address.label || address.hash,
    value: address.hash
  }))

  const handleDefaultAddressChange = useCallback(
    (addressHash: string) => {
      const newDefaultAddress = addresses.find((a) => a.hash === addressHash)
      newDefaultAddress && changeDefaultAddress(newDefaultAddress)
    },
    [addresses]
  )

  return (
    <Select
      options={addressOptions}
      onSelect={handleDefaultAddressChange}
      controlledValue={addressOptions.find((n) => n.value === defaultAddress?.hash)}
      title={t('Default address')}
      optionRender={({ value }) => <AddressBadge addressHash={value} disableCopy truncate />}
      id="defaultAddress"
      noMargin
      renderCustomComponent={SelectCustomComponent}
      skipEqualityCheck
    />
  )
}

export default DefaultAddressSwitch

const SelectCustomComponent = (value?: SelectOption<AddressHash>) => {
  const { t } = useTranslation()

  return (
    <Button role="secondary" short transparent data-tooltip-id="default" data-tooltip-content={t('Default address')}>
      {value?.value && <AddressBadge addressHash={value.value} disableCopy truncate />}
    </Button>
  )
}
