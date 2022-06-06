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

import { encrypt } from '@alephium/sdk/dist/lib/password-crypto'

export const latestUserDataVersion = '2022-05-27T12:00:00Z'

//
// Arguments are essentially dependencies of the migrations.
// Unfortunately mnemonics are a dependency due to being needed to encrypt address
// metadata, so migration must absolutely occur after login at the earliest.
//
// Future dependencies must be explained as they are added.
//
// ANY MODIFICATIONS MUST HAVE TESTS ADDED TO tests/migration.test.ts!
//
export const migrateUserData = (mnemonic: string) => {
  console.log('🚚 Migrating user data')
  _20220527_120000(mnemonic)
}

const _20220527_120000 = (mnemonic: string) => {
  const addressMetadata = Object.entries(localStorage).filter(([key, value]) => /^addresses-metadata/.test(key))
  for (const [key, json] of addressMetadata) {
    const addressSettingsList = JSON.parse(json)

    //
    // Means the old format is being used, which is not encrypted.
    // The data structure can be serialized and then encrypted.
    // We can also take this opportunity to start versioning our data.
    //
    if (Array.isArray(addressSettingsList)) {
      localStorage.setItem(
        key,
        JSON.stringify({
          version: '2022-05-27T12:00:00Z',
          encryptedSettings: encrypt(mnemonic, JSON.stringify(addressSettingsList))
        })
      )
    }
  }
}
