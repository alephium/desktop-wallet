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

import { walletGenerate } from '@alephium/sdk'
import { loadStoredAddressesMetadataOfAccount } from '../utils/addresses'
import * as migrate from '../utils/migration'
import { stringToDoubleSHA256HexString } from '../utils/misc'

//
// ANY CHANGES TO THIS FILE MUST BE REVIEWED BY AT LEAST ONE CORE CONTRIBUTOR
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

describe('_20220511_074100', () => {
  const settings = {
    isMain: true,
    label: "test",
    color: "blue"
  }

  const accounts = new Array(10)
  .fill({})
  .map((account, index) =>
    ({
      accountName: 'accountName' + index,
      wallet: walletGenerate(),
      index,
      settings
    })
  )

  const addressesMetadataLocalStorageKeyPrefix = 'addresses-metadata'
  const addressesMetadataLocalStorageKeySuffix = 'addresses-metadata'

  // from 1aa10a20e5da393345a0fda220a4a327d709f8ce
  const _loadStoredAddressesMetadataOfAccount = (accountName: string): AddressMetadata[] => {
    const data = localStorage.getItem(`${accountName}-${addressesMetadataLocalStorageKeySuffix}`)

    if (data === null) return []

    return JSON.parse(data)
  }
  const _storeAddressMetadataOfAccount = (accountName: string, index: number, settings: AddressSettings) => {
    const addressesMetadata = _loadStoredAddressesMetadataOfAccount(accountName)
    const existingAddressMetadata = addressesMetadata.find((data: AddressMetadata) => data.index === index)

    if (!existingAddressMetadata) {
      addressesMetadata.push({
        index,
        ...settings
      })
    } else {
      Object.assign(existingAddressMetadata, settings)
    }
    localStorage.setItem(`${accountName}-${addressesMetadataLocalStorageKeySuffix}`, JSON.stringify(addressesMetadata))
  }


  // from b8d121ed847cccc0aee841581b432a85ccca3aa5
  const constructMetadataKey = (walletName: string) => `${addressesMetadataLocalStorageKeyPrefix}-${walletName}`
  const loadStoredAddressesMetadataOfAccount = (accountName: string): AddressMetadata[] => {
    const data = localStorage.getItem(constructMetadataKey(accountName))

    if (data === null) return []

    return JSON.parse(data)
  }

  it('transitions the key names', () => {
    accounts.forEach(({ accountName, index, settings }) => {
      // This is necessary because getStorage().list() uses this to list the
      // wallet account names, which use the key names.
      localStorage.setItem('wallet-' + accountName, '')
      _storeAddressMetadataOfAccount(accountName, index, settings)
    })

    migrate._20220511_074100()

    accounts.forEach(({ accountName, wallet, index, settings }) => {
      const addresses = loadStoredAddressesMetadataOfAccount(accountName)
      expect(addresses[0]).toStrictEqual({...settings, index })
    })
  })
})

describe('_20220527_120000', () => {
  const settings = {
    isMain: true,
    label: "test",
    color: "blue"
  }
  const accounts = new Array(10)
  .fill({})
  .map((account, index) =>
    ({
      accountName: 'accountName' + index,
      wallet: walletGenerate(),
      index,
      settings
    })
  )

  // from b8d121ed847cccc0aee841581b432a85ccca3aa5
  const _addressesMetadataLocalStorageKeyPrefix = 'addresses-metadata'
  const _constructMapKey =  (addressHash: AddressHash) => `${addressHash}-${currentNetwork}`
  const _constructMetadataKey = (walletName: string) => `${_addressesMetadataLocalStorageKeyPrefix}-${walletName}`
  const _loadStoredAddressesMetadataOfAccount = (accountName: string): AddressMetadata[] => {
    const data = localStorage.getItem(_constructMetadataKey(accountName))

    if (data === null) return []

    return JSON.parse(data)
  }
  const _storeAddressMetadataOfAccount = (accountName: string, index: number, settings: AddressSettings) => {
    const addressesMetadata = _loadStoredAddressesMetadataOfAccount(accountName)
    const existingAddressMetadata = addressesMetadata.find((data: AddressMetadata) => data.index === index)

    if (!existingAddressMetadata) {
      addressesMetadata.push({
        index,
        ...settings
      })
    } else {
      Object.assign(existingAddressMetadata, settings)
    }
    localStorage.setItem(_constructMetadataKey(accountName), JSON.stringify(addressesMetadata))
  }

  it('properly encrypts and decrypts multiple user wallets', () => {
    accounts.forEach(({ accountName, index, settings }) =>
      _storeAddressMetadataOfAccount(accountName, index, settings)
    )

    accounts.forEach(({ accountName, wallet }) =>
      migrate._20220527_120000(wallet.mnemonic, accountName)
    )

    accounts.forEach(({ accountName, wallet, index, settings }) => {
      const addresses = loadStoredAddressesMetadataOfAccount(wallet.mnemonic, accountName)
      expect(addresses[0]).toStrictEqual({...settings, index })
    })
  })

  it('does not use the same wallet to encrypt address metadata', () => {
    const accountFirst = loadStoredAddressesMetadataOfAccount({
      mnemonic: accounts[0].wallet.mnemonic,
      accountName: accounts[0].accountName
    })

    const accountLast = loadStoredAddressesMetadataOfAccount({
      mnemonic: accounts[accounts.length - 1].wallet.mnemonic,
      accountName: accounts[accounts.length - 1].accountName)
    })
    expect(accountFirst).not.toStrictEqual(accountLast)
  })
})
