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

import { AddressMetadataRedux, AddressSettingsRedux } from '@/types/addresses'
import { latestAddressMetadataVersion } from '@/utils/migration'

import { DataKey, PersistentEncryptedStorage } from './encryptedPersistentStorage'

interface AddressMetadataStorageStoreProps {
  dataKey: DataKey
  index: number
  settings: AddressSettingsRedux
  isPassphraseUsed?: boolean
}

class AddressMetadataStorage extends PersistentEncryptedStorage {
  store({ dataKey, index, settings, isPassphraseUsed }: AddressMetadataStorageStoreProps) {
    if (isPassphraseUsed) return

    const addressesMetadata = this.load(dataKey)
    const existingAddressMetadata: AddressMetadataRedux | undefined = addressesMetadata.find(
      (data: AddressMetadataRedux) => data.index === index
    )
    const currentDefaultAddress: AddressMetadataRedux = addressesMetadata.find(
      (data: AddressMetadataRedux) => data.isDefault
    )

    if (!existingAddressMetadata) {
      addressesMetadata.push({
        index,
        ...settings
      })
    } else {
      Object.assign(existingAddressMetadata, settings)
    }

    if (settings.isDefault && currentDefaultAddress.index !== index) {
      console.log(`🟠 Removing old default address with index ${index}`)

      Object.assign(currentDefaultAddress, {
        ...currentDefaultAddress,
        isDefault: false
      })
    }

    console.log(`🟠 Storing address index ${index} metadata locally`)

    super._store(JSON.stringify(addressesMetadata), dataKey, isPassphraseUsed)
  }
}

const Storage = new AddressMetadataStorage('addresses-metadata', latestAddressMetadataVersion)

export default Storage
