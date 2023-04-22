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
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { selectAllAddresses, selectDefaultAddress } from '@/storage/addresses/addressesSelectors'
import { AddressHash } from '@/types/addresses'
import { NetworkNames } from '@/types/network'

interface AddressOption {
  label: string
  value: AddressHash
}

type NonCustomNetworkName = Exclude<keyof typeof NetworkNames, 'custom' | 'localhost'>

const DefaultAddressSwitch = () => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()

  const addresses = useAppSelector(selectAllAddresses)
  const defaultAddress = useAppSelector(selectDefaultAddress)

  const addressOptions: AddressOption[] = addresses.map((address) => ({
    label: address.label || address.hash,
    value: address.hash
  }))

  const handleDefaultAddressChange = useCallback(() => null, [])

  return (
    <Select
      options={addressOptions}
      onSelect={handleDefaultAddressChange}
      controlledValue={addressOptions.find((n) => n.value === defaultAddress?.hash)}
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

  const handleClick = () => null

  return (
    <Button role="secondary" short transparent data-tooltip-id="default" data-tooltip-content={t('Default address')}>
      <AddressBadge addressHash={value?.value} disableCopy />
    </Button>
  )
}
