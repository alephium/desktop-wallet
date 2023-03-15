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

import { encrypt, walletGenerate } from '@alephium/sdk'
import { nanoid } from 'nanoid'

import AddressMetadataStorage from '@/storage/addresses/addressMetadataPersistentStorage'
import SettingsStorage, { networkPresets } from '@/storage/settings/settingsPersistentStorage'
import WalletStorage from '@/storage/wallets/walletPersistentStorage'
import { AddressMetadata, DeprecatedAddressMetadata } from '@/types/addresses'
import { NetworkSettings } from '@/types/settings'
import * as migrate from '@/utils/migration'
import { stringToDoubleSHA256HexString } from '@/utils/misc'

const testWallet = walletGenerate()
const encryptedTestWallet = testWallet.encrypt('x')

const activeWallet = {
  id: nanoid(),
  name: 'Test wallet',
  mnemonic: testWallet.mnemonic,
  isPassphraseUsed: false
}

const activeWalletAddressSettings = { index: 0, isMain: true, label: 'test', color: 'blue' }

vi.mock('@/storage/store', async () => ({
  ...(await vi.importActual<typeof import('@/storage/store')>('@/storage/store')),
  store: { getState: () => ({ activeWallet }) }
}))

describe('_20220511_074100', () => {
  it('transitions the key names', () => {
    localStorage.setItem(`wallet-${activeWallet.name}`, JSON.stringify(encryptedTestWallet))
    localStorage.setItem(`${activeWallet.name}-addresses-metadata`, JSON.stringify([activeWalletAddressSettings]))

    migrate._20220511_074100()

    const data = localStorage.getItem(`addresses-metadata-${activeWallet.name}`)
    expect(data).not.toBeNull()

    const addresses = data ? JSON.parse(data) : []
    expect(addresses).toHaveLength(1)
    expect(addresses[0]).toStrictEqual(activeWalletAddressSettings)
  })
})

describe('_20230228_155100', () => {
  describe('Swaps wallet name for wallet ID in localStorage key and stores wallet name and ID in value', () => {
    it('when the wallet data is stored as a string', () => {
      localStorage.setItem(`wallet-${activeWallet.name}`, encryptedTestWallet)

      _migrateWalletData()
    })

    it('when the wallet data is stored as an object', () => {
      localStorage.setItem(`wallet-${activeWallet.name}`, JSON.stringify(encryptedTestWallet))

      _migrateWalletData()
    })
  })

  describe('Uses wallet ID to store addresses metadata instead of wallet name', () => {
    it('when the address metadata are stored unencrypted using the wallet name', () => {
      const oldKey = `addresses-metadata-${activeWallet.name}`
      const oldValue = JSON.stringify([activeWalletAddressSettings])

      localStorage.setItem(`wallet-${activeWallet.name}`, JSON.stringify(encryptedTestWallet))
      localStorage.setItem(oldKey, oldValue)

      const walletData = _migrateWalletData()

      expect(localStorage.getItem(`addresses-metadata-${walletData.id}`)).toStrictEqual(oldValue)
      expect(localStorage.getItem(oldKey)).toBeNull()
    })

    it('when the address metadata are stored encrypted using the wallet name', () => {
      _migrateEncryptedAddressesMetadata(`addresses-metadata-${activeWallet.name}`)
    })

    it('when the address metadata are stored using the wallet name double-hashed', () => {
      _migrateEncryptedAddressesMetadata(`addresses-metadata-${stringToDoubleSHA256HexString(activeWallet.name)}`)
    })
  })

  const _migrateWalletData = () => {
    migrate._20230228_155100()

    const wallets = WalletStorage.list()
    expect(wallets).toHaveLength(1)

    const data = localStorage.getItem(`wallet-${wallets[0].id}`)
    expect(data).not.toBeNull()

    const walletData = data ? JSON.parse(data) : {}
    expect(walletData).toHaveProperty('id')
    expect(walletData).toHaveProperty('name')
    expect(walletData.name).toEqual(activeWallet.name)

    return walletData
  }

  const _migrateEncryptedAddressesMetadata = (oldKey: string) => {
    localStorage.setItem(`wallet-${activeWallet.name}`, JSON.stringify(encryptedTestWallet))
    localStorage.setItem(oldKey, encrypt('x', JSON.stringify([activeWalletAddressSettings])))

    const walletData = _migrateWalletData()

    const data = localStorage.getItem(`addresses-metadata-${walletData.id}`)
    expect(data).not.toBeNull()
    expect(localStorage.getItem(oldKey)).toBeNull()

    const addressesMetadata = data ? JSON.parse(data) : undefined
    expect(addressesMetadata).toHaveProperty('encrypted')
    expect(addressesMetadata).not.toHaveProperty('encryptedSettings')
  }
})

describe('_20220527_120000', () => {
  it('properly encrypts and decrypts a wallet', () => {
    localStorage.setItem('wallet-' + activeWallet.id, 'test')
    localStorage.setItem(`addresses-metadata-${activeWallet.id}`, JSON.stringify([activeWalletAddressSettings]))

    migrate._20220527_120000()

    const addresses = AddressMetadataStorage.load()
    expect(addresses).toHaveLength(1)
    expect(addresses[0]).toStrictEqual(activeWalletAddressSettings)
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

describe('_v153_networkSettingsMigration', () => {
  it('should migrate pre-v1.5.3 deprecated mainnet network settings', () => {
    SettingsStorage.store('network', {
      networkId: 0,
      nodeHost: 'https://wallet-v16.mainnet.alephium.org',
      explorerApiHost: 'https://backend-v112.mainnet.alephium.org',
      explorerUrl: 'https://explorer.alephium.org'
    })

    migrate._v153_networkSettingsMigration()

    const migratedSettings = SettingsStorage.load('network') as NetworkSettings

    expect(migratedSettings.nodeHost).toEqual(networkPresets.mainnet.nodeHost)
    expect(migratedSettings.explorerApiHost).toEqual(networkPresets.mainnet.explorerApiHost)
    expect(migratedSettings.explorerUrl).toEqual(networkPresets.mainnet.explorerUrl)
  })

  it('should migrate pre-v1.5.3 deprecated testnet network settings', () => {
    SettingsStorage.store('network', {
      networkId: 1,
      nodeHost: 'https://wallet-v16.testnet.alephium.org',
      explorerApiHost: 'https://backend-v112.testnet.alephium.org',
      explorerUrl: 'https://explorer.testnet.alephium.org'
    })

    migrate._v153_networkSettingsMigration()

    const migratedSettings = SettingsStorage.load('network') as NetworkSettings

    expect(migratedSettings.nodeHost).toEqual(networkPresets.testnet.nodeHost)
    expect(migratedSettings.explorerApiHost).toEqual(networkPresets.testnet.explorerApiHost)
    expect(migratedSettings.explorerUrl).toEqual(networkPresets.testnet.explorerUrl)
  })

  it('should not migrate pre-v1.5.3 custom network settings', () => {
    const customSettings = {
      networkId: 3,
      nodeHost: 'https://mainnet-wallet.custom.com',
      explorerApiHost: 'https://mainnet-backend.custom.com',
      explorerUrl: 'https://explorer.custom.com'
    }

    SettingsStorage.store('network', customSettings)

    migrate._v153_networkSettingsMigration()

    const migratedSettings = SettingsStorage.load('network') as NetworkSettings

    expect(migratedSettings.nodeHost).toEqual(customSettings.nodeHost)
    expect(migratedSettings.explorerApiHost).toEqual(customSettings.explorerApiHost)
    expect(migratedSettings.explorerUrl).toEqual(customSettings.explorerUrl)
  })
})

describe('_20230209_124300', () => {
  it('should replace the isMain address metadata settings with isDefault and ensure there is a color', () => {
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
      `addresses-metadata-${activeWallet.id}`,
      JSON.stringify({
        version: '2022-05-27T12:00:00Z',
        encrypted: encrypt(activeWallet.mnemonic, JSON.stringify(deprecatedAddressMetadata))
      })
    )

    migrate._20230209_124300()

    const metadata = AddressMetadataStorage.load() as AddressMetadata[]

    expect(metadata[0]).not.toHaveProperty('isMain')
    expect(metadata[0].isDefault).toEqual(false)
    expect(metadata[0].index).toEqual(0)
    expect(metadata[0].color).toBeDefined()
    expect(metadata[0].color).toBeTruthy()
    expect(metadata[1]).not.toHaveProperty('isMain')
    expect(metadata[1].isDefault).toEqual(true)
    expect(metadata[1].index).toEqual(1)
    expect(metadata[1].color).toEqual('red')
    expect(metadata[1].label).toEqual('My main one')
  })
})

afterEach(() => {
  localStorage.clear()
})
