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

import { getStorage } from '@alephium/sdk'
import { encrypt } from '@alephium/sdk'

import { stringToDoubleSHA256HexString } from './misc'

export const latestAddressMetadataVersion = '2022-05-27T12:00:00Z'

//
// ANY CHANGES TO THIS FILE MUST BE REVIEWED BY AT LEAST ONE CORE CONTRIBUTOR
//
// Arguments are essentially dependencies of the migrations.
// Unfortunately mnemonics are a dependency due to being needed to encrypt address
// metadata, so migration must absolutely occur after login at the earliest.
//
// Future dependencies must be explained as they are added.
//
// ANY MODIFICATIONS MUST HAVE TESTS ADDED TO tests/migration.test.ts!
//
export const migrateUserData = (mnemonic: string, walletName: string) => {
  console.log('🚚 Migrating user data')
  _20220511_074100()
  _20220527_120000(mnemonic, walletName)
}

// Change localStorage address metadata key from "{walletName}-addresses-metadata" to "addresses-metadata-{walletName}"
// See https://github.com/alephium/desktop-wallet/issues/236
export const _20220511_074100 = () => {
  const Storage = getStorage()
  const walletNames = Storage.list()

  for (const walletName of walletNames) {
    const keyDeprecated = `${walletName}-addresses-metadata`
    const data = localStorage.getItem(keyDeprecated)

    if (data) {
      const addressesMetadataLocalStorageKeyPrefix = 'addresses-metadata'
      const keyNew = `${addressesMetadataLocalStorageKeyPrefix}-${walletName}`

      localStorage.setItem(keyNew, data)
      localStorage.removeItem(keyDeprecated)
    }
  }
}

// Encrypt address metadata key and value
export const _20220527_120000 = (mnemonic: string, walletName: string) => {
  const addressesMetadataLocalStorageKeyPrefix = 'addresses-metadata'
  const keyDeprecated = `${addressesMetadataLocalStorageKeyPrefix}-${walletName}`

  const json = localStorage.getItem(keyDeprecated)
  if (json === null) return

  const addressSettingsList = JSON.parse(json)

  //
  // The old format is not encrypted and is a list.
  // The data structure can be deserialized and then encrypted.
  // We can also take this opportunity to start versioning our data.
  //
  if (Array.isArray(addressSettingsList)) {
    const keyNew = `${addressesMetadataLocalStorageKeyPrefix}-${stringToDoubleSHA256HexString(walletName)}`

    localStorage.setItem(
      keyNew,
      JSON.stringify({
        version: '2022-05-27T12:00:00Z',
        encryptedSettings: encrypt(mnemonic, JSON.stringify(addressSettingsList))
      })
    )

    localStorage.removeItem(keyDeprecated)
  }
}
