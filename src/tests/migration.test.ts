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

import * as migrate from '../utils/migration'
import { walletGenerate } from '@alephium/sdk'

//
// Each step should:
// * Create a wallet
// * Call the storeAddressMetadataOfAccount function (depends on loadStoredAddressesMetadataOfAccount)
// * Call the migrate step
// * Verify it worked
//
// This will mean you need to go into the git history to get the code for
// address metadata storage (store *and* load) at a period in time.
//

test('_20220527_120000', () => {
  const wallet = walletGenerate()
  const accountName = 'test'

  const settings = {
    isMain: true,
    label: "test",
    color: "blue"
  }

  // from b8d121ed847cccc0aee841581b432a85ccca3aa5
  const _addressesMetadataLocalStorageKeyPrefix = 'addresses-metadata'
  const _constructMapKey =  (addressHash: AddressHash) => `${addressHash}-${currentNetwork}`
  const _constructMetadataKey = (walletName: string) => `${addressesMetadataLocalStorageKeyPrefix}-${walletName}`
  const _loadStoredAddressesMetadataOfAccount = (accountName: string): AddressMetadata[] => {
    const data = localStorage.getItem(constructMetadataKey(accountName))

    if (data === null) return []

    return JSON.parse(data)
  }
  const _storeAddressMetadataOfAccount = (accountName: string, index: number, settings: AddressSettings) => {
    const addressesMetadata = loadStoredAddressesMetadataOfAccount(accountName)
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
    localStorage.setItem(constructMetadataKey(accountName), JSON.stringify(addressesMetadata))
  }

  _storeAddressMetadataOfAccount(accountName, 0, settings)
  migrate._20220527_120000()
  const addresses = loadStoredAddressesMetadataOfAccount(wallet.mnemonic, accountName)
  expect(addresses[0]).ToBe({...settings, index: 0 })
})
