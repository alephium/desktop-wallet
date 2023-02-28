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

import {
  addressSettingsSaved,
  defaultAddressChanged,
  newAddressesSaved,
  syncAddressesData
} from '@/storage/app-state/slices/addressesSlice'
import { store } from '@/storage/app-state/store'
import AddressMetadataStorage from '@/storage/persistent-storage/addressMetadataPersistentStorage'
import { Address, AddressBase, AddressSettings } from '@/types/addresses'

export const saveNewAddresses = (addresses: AddressBase[]) => {
  addresses.forEach((address) =>
    AddressMetadataStorage.store({
      index: address.index,
      settings: {
        isDefault: address.isDefault,
        label: address.label,
        color: address.color
      }
    })
  )

  store.dispatch(newAddressesSaved(addresses))
  store.dispatch(syncAddressesData(addresses.map((address) => address.hash)))
}

export const changeDefaultAddress = (address: Address) => {
  AddressMetadataStorage.store({
    index: address.index,
    settings: {
      isDefault: true,
      label: address.label,
      color: address.color
    }
  })

  store.dispatch(defaultAddressChanged(address))
}

export const saveAddressSettings = (address: AddressBase, settings: AddressSettings) => {
  AddressMetadataStorage.store({ index: address.index, settings })
  store.dispatch(addressSettingsSaved({ addressHash: address.hash, settings }))
}
