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

import { encrypt, getStorage, walletGenerate } from '@alephium/sdk'

import AddressMetadataStorage from '@/storage/persistent-storage/addressMetadataPersistentStorage'
import SettingsStorage, { networkPresets } from '@/storage/persistent-storage/settingsPersistentStorage'
import WalletStorage from '@/storage/persistent-storage/walletPersistentStorage'
import { AddressMetadata, DeprecatedAddressMetadata, DeprecatedAddressSettings } from '@/types/addresses'
import { NetworkSettings } from '@/types/settings'
import * as migrate from '@/utils/migration'
import { stringToDoubleSHA256HexString } from '@/utils/misc'

describe('_20220511_074100', () => {
  const settings = {
    isMain: true,
    label: 'test',
    color: 'blue'
  }

  const wallets = new Array(10).fill({}).map((wallet, index) => ({
    walletName: 'walletName' + index,
    wallet: walletGenerate(),
    index,
    settings
  }))

  const addressesMetadataLocalStorageKeyPrefix = 'addresses-metadata'
  const addressesMetadataLocalStorageKeySuffix = 'addresses-metadata'

  // from 1aa10a20e5da393345a0fda220a4a327d709f8ce
  const _loadStoredAddressesMetadataOfWallet = (walletName: string): DeprecatedAddressMetadata[] => {
    const data = localStorage.getItem(`${walletName}-${addressesMetadataLocalStorageKeySuffix}`)

    if (data === null) return []

    return JSON.parse(data)
  }
  const _storeAddressMetadataOfWallet = (walletName: string, index: number, settings: DeprecatedAddressSettings) => {
    const addressesMetadata = _loadStoredAddressesMetadataOfWallet(walletName)
    const existingAddressMetadata = addressesMetadata.find((data: DeprecatedAddressMetadata) => data.index === index)

    if (!existingAddressMetadata) {
      addressesMetadata.push({
        index,
        ...settings
      })
    } else {
      Object.assign(existingAddressMetadata, settings)
    }
    localStorage.setItem(`${walletName}-${addressesMetadataLocalStorageKeySuffix}`, JSON.stringify(addressesMetadata))
  }

  // from b8d121ed847cccc0aee841581b432a85ccca3aa5
  const constructMetadataKey = (walletName: string) => `${addressesMetadataLocalStorageKeyPrefix}-${walletName}`
  const loadStoredAddressesMetadataOfWallet = (walletName: string): DeprecatedAddressMetadata[] => {
    const data = localStorage.getItem(constructMetadataKey(walletName))

    if (data === null) return []

    return JSON.parse(data)
  }

  it('transitions the key names', () => {
    wallets.forEach(({ walletName, index, settings }) => {
      // This is necessary because getStorage().list() uses this to list the
      // wallet names, which use the key names.
      localStorage.setItem('wallet-' + walletName, '')
      _storeAddressMetadataOfWallet(walletName, index, settings)
    })

    migrate._20220511_074100()

    wallets.forEach(({ walletName, wallet, index, settings }) => {
      const addresses = loadStoredAddressesMetadataOfWallet(walletName)
      expect(addresses[0]).toStrictEqual({ ...settings, index })
    })
  })
})

describe('_20220527_120000', () => {
  const settings = {
    isMain: true,
    label: 'test',
    color: 'blue'
  }
  const wallets = new Array(10).fill({}).map((wallet, index) => ({
    walletName: 'walletName' + index,
    wallet: walletGenerate(),
    index,
    settings
  }))

  // from b8d121ed847cccc0aee841581b432a85ccca3aa5
  const _addressesMetadataLocalStorageKeyPrefix = 'addresses-metadata'
  const _constructMetadataKey = (walletName: string) => `${_addressesMetadataLocalStorageKeyPrefix}-${walletName}`
  const _loadStoredAddressesMetadataOfWallet = (walletName: string): DeprecatedAddressMetadata[] => {
    const data = localStorage.getItem(_constructMetadataKey(walletName))

    if (data === null) return []

    return JSON.parse(data)
  }
  const _storeAddressMetadataOfWallet = (walletName: string, index: number, settings: DeprecatedAddressSettings) => {
    const addressesMetadata = _loadStoredAddressesMetadataOfWallet(walletName)
    const existingAddressMetadata = addressesMetadata.find((data: DeprecatedAddressMetadata) => data.index === index)

    if (!existingAddressMetadata) {
      addressesMetadata.push({
        index,
        ...settings
      })
    } else {
      Object.assign(existingAddressMetadata, settings)
    }
    localStorage.setItem(_constructMetadataKey(walletName), JSON.stringify(addressesMetadata))
  }

  it('properly encrypts and decrypts multiple user wallets', () => {
    wallets.forEach(({ walletName, index, settings }) => _storeAddressMetadataOfWallet(walletName, index, settings))

    wallets.forEach(({ walletName, wallet }) => migrate._20220527_120000({ mnemonic: wallet.mnemonic, walletName }))

    wallets.forEach(({ walletName, wallet, index, settings }) => {
      const addresses = AddressMetadataStorage.load({
        mnemonic: wallet.mnemonic,
        walletName
      })
      expect(addresses[0]).toStrictEqual({ ...settings, index })
    })
  })

  it('does not use the same wallet to encrypt address metadata', () => {
    const walletFirst = AddressMetadataStorage.load({
      mnemonic: wallets[0].wallet.mnemonic,
      walletName: wallets[0].walletName
    })

    const walletLast = AddressMetadataStorage.load({
      mnemonic: wallets[wallets.length - 1].wallet.mnemonic,
      walletName: wallets[wallets.length - 1].walletName
    })
    expect(walletFirst).not.toStrictEqual(walletLast)
  })
})

describe('_20230124_164900', () => {
  const wallet = {
    name: 'John Doe',
    unencryptedWallet: walletGenerate()
  }

  it('replaces the JSON stringified encrypted wallet string with simply the encrypted wallet string', () => {
    const Storage = getStorage()
    let storedWallet

    Storage.save(wallet.name, wallet.unencryptedWallet.encrypt('passw0rd'))

    storedWallet = localStorage.getItem(`wallet-${wallet.name}`)

    if (storedWallet) {
      expect(typeof JSON.parse(storedWallet)).toEqual('string')
      expect(typeof JSON.parse(JSON.parse(storedWallet))).toEqual('object')
    }

    migrate._20230124_164900()

    storedWallet = localStorage.getItem(`wallet-${wallet.name}`)

    if (storedWallet) {
      expect(typeof JSON.parse(storedWallet)).toEqual('object')
    }

    const unencryptedWallet = WalletStorage.load(wallet.name, 'passw0rd')
    expect(unencryptedWallet.mnemonic).toEqual(wallet.unencryptedWallet.mnemonic)
  })
})

describe('_20211220_194004', () => {
  it('should migrate deprecated theme settings', () => {
    localStorage.setItem('theme', 'pink')
    expect(localStorage.getItem('theme')).toEqual('pink')

    migrate._20211220_194004()

    expect(SettingsStorage.loadAll().general.theme).toEqual('pink')
    expect(localStorage.getItem('theme')).toBeNull()
  })
})

describe('_v140_networkSettingsMigration', () => {
  it('should migrate pre-v1.4.0 deprecated mainnet network settings', () => {
    SettingsStorage.store('network', {
      networkId: 0,
      nodeHost: 'https://mainnet-wallet.alephium.org',
      explorerApiHost: 'https://mainnet-backend.alephium.org',
      explorerUrl: 'https://explorer.alephium.org'
    })

    migrate._v140_networkSettingsMigration()

    const migratedSettings = SettingsStorage.load('network') as NetworkSettings

    expect(migratedSettings.nodeHost).toEqual(networkPresets.mainnet.nodeHost)
    expect(migratedSettings.explorerApiHost).toEqual(networkPresets.mainnet.explorerApiHost)
    expect(migratedSettings.explorerUrl).toEqual(networkPresets.mainnet.explorerUrl)
  })

  it('should migrate pre-v1.4.0 deprecated testnet network settings', () => {
    SettingsStorage.store('network', {
      networkId: 1,
      nodeHost: 'https://testnet-wallet.alephium.org',
      explorerApiHost: 'https://testnet-backend.alephium.org',
      explorerUrl: 'https://testnet.alephium.org'
    })

    migrate._v140_networkSettingsMigration()

    const migratedSettings = SettingsStorage.load('network') as NetworkSettings

    expect(migratedSettings.nodeHost).toEqual(networkPresets.testnet.nodeHost)
    expect(migratedSettings.explorerApiHost).toEqual(networkPresets.testnet.explorerApiHost)
    expect(migratedSettings.explorerUrl).toEqual(networkPresets.testnet.explorerUrl)
  })

  it('should not migrate pre-v1.4.0 custom network settings', () => {
    const customSettings = {
      networkId: 3,
      nodeHost: 'https://mainnet-wallet.custom.com',
      explorerApiHost: 'https://mainnet-backend.custom.com',
      explorerUrl: 'https://explorer.custom.com'
    }

    SettingsStorage.store('network', customSettings)

    migrate._v140_networkSettingsMigration()

    const migratedSettings = SettingsStorage.load('network') as NetworkSettings

    expect(migratedSettings.nodeHost).toEqual(customSettings.nodeHost)
    expect(migratedSettings.explorerApiHost).toEqual(customSettings.explorerApiHost)
    expect(migratedSettings.explorerUrl).toEqual(customSettings.explorerUrl)
  })
})

describe('_v150_networkSettingsMigration', () => {
  it('should migrate pre-v1.5.0 deprecated mainnet network settings', () => {
    SettingsStorage.store('network', {
      networkId: 0,
      nodeHost: 'https://wallet-v18.mainnet.alephium.org',
      explorerApiHost: 'https://backend-v18.mainnet.alephium.org',
      explorerUrl: 'https://explorer-v18.mainnet.alephium.org'
    })

    migrate._v150_networkSettingsMigration()

    const migratedSettings = SettingsStorage.load('network') as NetworkSettings

    expect(migratedSettings.nodeHost).toEqual(networkPresets.mainnet.nodeHost)
    expect(migratedSettings.explorerApiHost).toEqual(networkPresets.mainnet.explorerApiHost)
    expect(migratedSettings.explorerUrl).toEqual(networkPresets.mainnet.explorerUrl)
  })

  it('should migrate pre-v1.5.0 deprecated testnet network settings', () => {
    SettingsStorage.store('network', {
      networkId: 1,
      nodeHost: 'https://wallet-v18.testnet.alephium.org',
      explorerApiHost: 'https://backend-v18.testnet.alephium.org',
      explorerUrl: 'https://explorer-v18.testnet.alephium.org'
    })

    migrate._v150_networkSettingsMigration()

    const migratedSettings = SettingsStorage.load('network') as NetworkSettings

    expect(migratedSettings.nodeHost).toEqual(networkPresets.testnet.nodeHost)
    expect(migratedSettings.explorerApiHost).toEqual(networkPresets.testnet.explorerApiHost)
    expect(migratedSettings.explorerUrl).toEqual(networkPresets.testnet.explorerUrl)
  })

  it('should not migrate pre-v1.5.0 custom network settings', () => {
    const customSettings = {
      networkId: 3,
      nodeHost: 'https://mainnet-wallet.custom.com',
      explorerApiHost: 'https://mainnet-backend.custom.com',
      explorerUrl: 'https://explorer.custom.com'
    }

    SettingsStorage.store('network', customSettings)

    migrate._v150_networkSettingsMigration()

    const migratedSettings = SettingsStorage.load('network') as NetworkSettings

    expect(migratedSettings.nodeHost).toEqual(customSettings.nodeHost)
    expect(migratedSettings.explorerApiHost).toEqual(customSettings.explorerApiHost)
    expect(migratedSettings.explorerUrl).toEqual(customSettings.explorerUrl)
  })
})

describe('_20230209_124300', () => {
  const addressesMetadataLocalStorageKeyPrefix = 'addresses-metadata'
  const addressesMetadataEncryptionVersion = '2022-05-27T12:00:00Z'
  const wallet = {
    name: 'John Doe',
    unencryptedWallet: walletGenerate()
  }

  it('should replace the isMain address metadata settings with isDefault and ensure there is a color', () => {
    const dataKey = { mnemonic: wallet.unencryptedWallet.mnemonic, walletName: wallet.name }
    const deprecatedAddressMetadata: DeprecatedAddressMetadata[] = [
      {
        index: 0,
        isMain: false
      },
      {
        index: 1,
        isMain: true,
        color: 'red',
        label: 'My main one'
      }
    ]

    localStorage.setItem(
      `${addressesMetadataLocalStorageKeyPrefix}-${stringToDoubleSHA256HexString(wallet.name)}`,
      JSON.stringify({
        version: addressesMetadataEncryptionVersion,
        encryptedSettings: encrypt(wallet.unencryptedWallet.mnemonic, JSON.stringify(deprecatedAddressMetadata))
      })
    )

    migrate._20230209_124300(dataKey)

    const metadata = AddressMetadataStorage.load(dataKey) as AddressMetadata[]

    expect(Object.prototype.hasOwnProperty.call(metadata[0], 'isMain')).toBeFalsy()
    expect(metadata[0].isDefault).toEqual(false)
    expect(metadata[0].index).toEqual(0)
    expect(metadata[0].color).toBeDefined()
    expect(metadata[0].color).toBeTruthy()
    expect(Object.prototype.hasOwnProperty.call(metadata[1], 'isMain')).toBeFalsy()
    expect(metadata[1].isDefault).toEqual(true)
    expect(metadata[1].index).toEqual(1)
    expect(metadata[1].color).toEqual('red')
    expect(metadata[1].label).toEqual('My main one')
  })
})
