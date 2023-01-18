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

import { AddressMetadata, AddressSettings } from '@/types/addresses'
import { latestAddressMetadataVersion } from '@/utils/migration'

import { DataKey, PersistentEncryptedStorage } from './encrypted-storage'

class AddressMetadataStorage extends PersistentEncryptedStorage {
  store({ mnemonic, walletName }: DataKey, index: number, settings: AddressSettings, isPassphraseUsed?: boolean) {
    if (isPassphraseUsed) return

    const addressesMetadata = this.load({ walletName, mnemonic })
    const existingAddressMetadata = addressesMetadata.find((data: AddressMetadata) => data.index === index)

    if (!existingAddressMetadata) {
      addressesMetadata.push({
        index,
        ...settings
      })
    } else {
      Object.assign(existingAddressMetadata, settings)
    }
    console.log(`🟠 Storing address index ${index} metadata locally`)

    super._store(JSON.stringify(addressesMetadata), { mnemonic, walletName }, isPassphraseUsed)
  }
}

const Storage = new AddressMetadataStorage('addresses-metadata', latestAddressMetadataVersion)

export default Storage
