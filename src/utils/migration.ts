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
import { encrypt } from '@alephium/sdk/dist/lib/password-crypto'

import { constructMetadataKey } from './addresses'
import { stringToDoubleSHA256HexString } from './misc'

export const latestUserDataVersion = '2022-05-27T12:00:00Z'

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
export const migrateUserData = (mnemonic: string, accountName: string, passphrase?: string) => {
  console.log('🚚 Migrating user data')
  _20220511_074100()
  _20220527_120000(mnemonic, accountName, passphrase)
}

// See https://github.com/alephium/desktop-wallet/issues/236
export const _20220511_074100 = () => {
  const Storage = getStorage()
  const accountNames = Storage.list()

  for (const accountName of accountNames) {
    const keyDeprecated = `${accountName}-addresses-metadata`
    const data = localStorage.getItem(keyDeprecated)

    if (data) {
      const addressesMetadataLocalStorageKeyPrefix = 'addresses-metadata'
      const keyNew = `${addressesMetadataLocalStorageKeyPrefix}-${accountName}`

      localStorage.setItem(keyNew, data)
      localStorage.removeItem(keyDeprecated)
    }
  }
}

export const _20220527_120000 = (mnemonic: string, accountName: string, passphraseHash?: string) => {
  const addressesMetadataLocalStorageKeyPrefix = 'addresses-metadata'
  const keyDeprecated = `${addressesMetadataLocalStorageKeyPrefix}-${accountName}`

  const json = localStorage.getItem(keyDeprecated)
  if (json === null) return

  const addressSettingsList = JSON.parse(json)

  //
  // The old format is not encrypted and is a list.
  // The data structure can be deserialized and then encrypted.
  // We can also take this opportunity to start versioning our data.
  //
  if (Array.isArray(addressSettingsList)) {
    const keyNew = `${addressesMetadataLocalStorageKeyPrefix}-${stringToDoubleSHA256HexString(accountName + (passphraseHash ?? ''))}`
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
