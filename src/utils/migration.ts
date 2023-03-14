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

import { encrypt } from '@alephium/sdk'
import { merge } from 'lodash'
import { nanoid } from 'nanoid'

import AddressMetadataStorage from '@/storage/persistent-storage/addressMetadataPersistentStorage'
import { getEncryptedStoragePropsFromActiveWallet } from '@/storage/persistent-storage/encryptedPersistentStorage'
import SettingsStorage, {
  defaultSettings,
  networkPresets
} from '@/storage/persistent-storage/settingsPersistentStorage'
import WalletStorage from '@/storage/persistent-storage/walletPersistentStorage'
import { AddressMetadata, DeprecatedAddressMetadata } from '@/types/addresses'
import { GeneralSettings, NetworkSettings, ThemeType } from '@/types/settings'
import { StoredWallet } from '@/types/wallet'
import { getRandomLabelColor } from '@/utils/colors'
import { stringToDoubleSHA256HexString } from '@/utils/misc'

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

// We first run the migration that do not require authentication, on app launch
export const migrateWalletData = () => {
  console.log('🚚 Migrating wallet data')

  _20220511_074100()
  _20230228_155100()
}

export const migrateGeneralSettings = (): GeneralSettings => {
  console.log('🚚 Migrating settings')

  _20211220_194004()

  return SettingsStorage.load('general') as GeneralSettings
}

export const migrateNetworkSettings = (): NetworkSettings => {
  console.log('🚚 Migrating network settings')

  _v140_networkSettingsMigration()
  _v150_networkSettingsMigration()
  _v153_networkSettingsMigration()

  return SettingsStorage.load('network') as NetworkSettings
}

// Then we run user data migrations after the user has authenticated
export const migrateUserData = () => {
  console.log('🚚 Migrating user data')

  _20220527_120000()
  _20230209_124300()
}

// Change localStorage address metadata key from "{walletName}-addresses-metadata" to "addresses-metadata-{walletName}"
// See https://github.com/alephium/desktop-wallet/issues/236
export const _20220511_074100 = () => {
  const prefix = 'wallet-'
  const prefixLength = prefix.length
  const addressesMetadataLocalStorageKeyPrefix = 'addresses-metadata-'

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)

    if (key?.startsWith(prefix)) {
      const data = localStorage.getItem(key)

      if (!data) continue

      const walletName = key.substring(prefixLength)
      const keyDeprecated = `${walletName}-addresses-metadata`
      const addressesMetadata = localStorage.getItem(keyDeprecated)

      if (addressesMetadata) {
        const keyNew = `${addressesMetadataLocalStorageKeyPrefix}${walletName}`

        localStorage.setItem(keyNew, addressesMetadata)
        localStorage.removeItem(keyDeprecated)
      }
    }
  }
}

// Encrypt address metadata value
export const _20220527_120000 = () => {
  const { mnemonic, walletId } = getEncryptedStoragePropsFromActiveWallet()
  const addressesMetadataLocalStorageKeyPrefix = 'addresses-metadata'
  const key = `${addressesMetadataLocalStorageKeyPrefix}-${walletId}`

  const json = localStorage.getItem(key)
  if (json === null) return

  const addressSettingsList = JSON.parse(json)

  // The old format is not encrypted and is a list. The data structure can be deserialized and then encrypted. We can
  // also take this opportunity to start versioning our data.
  if (Array.isArray(addressSettingsList)) {
    localStorage.setItem(
      key,
      JSON.stringify({
        version: '2022-05-27T12:00:00Z',
        encrypted: encrypt(mnemonic, JSON.stringify(addressSettingsList))
      })
    )
  }
}

// Remove "theme" from localStorage and add it inside general settings
export const _20211220_194004 = () => {
  const generalSettings = SettingsStorage.load('general') as GeneralSettings
  const deprecatedThemeSetting = window.localStorage.getItem('theme')
  deprecatedThemeSetting && window.localStorage.removeItem('theme')

  const migratedGeneralSettings = deprecatedThemeSetting
    ? { ...generalSettings, theme: deprecatedThemeSetting as ThemeType }
    : generalSettings
  const newGeneralSettings = merge({}, defaultSettings.general, migratedGeneralSettings)

  SettingsStorage.store('general', newGeneralSettings)
}

export const _v140_networkSettingsMigration = () =>
  migrateReleaseNetworkSettings({
    'https://mainnet-wallet.alephium.org': networkPresets.mainnet.nodeHost,
    'https://testnet-wallet.alephium.org': networkPresets.testnet.nodeHost,
    'https://mainnet-backend.alephium.org': networkPresets.mainnet.explorerApiHost,
    'https://testnet-backend.alephium.org': networkPresets.testnet.explorerApiHost,
    'https://testnet.alephium.org': networkPresets.testnet.explorerUrl
  })

export const _v150_networkSettingsMigration = () =>
  migrateReleaseNetworkSettings({
    'https://wallet-v18.mainnet.alephium.org': networkPresets.mainnet.nodeHost,
    'https://wallet-v18.testnet.alephium.org': networkPresets.testnet.nodeHost,
    'https://backend-v18.mainnet.alephium.org': networkPresets.mainnet.explorerApiHost,
    'https://backend-v18.testnet.alephium.org': networkPresets.testnet.explorerApiHost,
    'https://explorer-v18.mainnet.alephium.org': networkPresets.mainnet.explorerUrl,
    'https://explorer-v18.testnet.alephium.org': networkPresets.testnet.explorerUrl
  })

export const _v153_networkSettingsMigration = () =>
  migrateReleaseNetworkSettings({
    'https://wallet-v16.mainnet.alephium.org': networkPresets.mainnet.nodeHost,
    'https://wallet-v16.testnet.alephium.org': networkPresets.testnet.nodeHost,
    'https://backend-v112.mainnet.alephium.org': networkPresets.mainnet.explorerApiHost,
    'https://backend-v112.testnet.alephium.org': networkPresets.testnet.explorerApiHost
  })

const migrateReleaseNetworkSettings = (migrationsMapping: Record<string, string>) => {
  const { nodeHost, explorerApiHost, explorerUrl } = SettingsStorage.load('network') as NetworkSettings

  const migratedNetworkSettings = {
    nodeHost: migrationsMapping[nodeHost] ?? nodeHost,
    explorerApiHost: migrationsMapping[explorerApiHost] ?? explorerApiHost,
    explorerUrl: migrationsMapping[explorerUrl] ?? explorerUrl
  }

  const newNetworkSettings = merge({}, defaultSettings.network, migratedNetworkSettings)
  SettingsStorage.store('network', newNetworkSettings)
}

// 1. Generate a unique wallet ID for every wallet entry
// 2. Use wallet ID as key to store wallet and address data, instead of wallet name
// 3. Store wallet ID and wallet name in entry value
export const _20230228_155100 = () => {
  const walletPrefix = 'wallet-'
  const walletPrefixLength = walletPrefix.length
  const addressesMetadataPrefix = 'addresses-metadata-'

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)

    if (key?.startsWith(walletPrefix)) {
      const data = localStorage.getItem(key)

      if (!data) continue

      const nameOrId = key.substring(walletPrefixLength)
      const walletOldKey = `${walletPrefix}${nameOrId}`
      const walletRaw = localStorage.getItem(walletOldKey)

      if (!walletRaw) continue

      const wallet = JSON.parse(walletRaw)

      if (
        typeof wallet === 'string' ||
        (typeof wallet === 'object' &&
          !Object.prototype.hasOwnProperty.call(wallet, 'id') &&
          !Object.prototype.hasOwnProperty.call(wallet, 'name'))
      ) {
        const id = nanoid()
        const name = nameOrId // Since the wallet didn't have a "name" property, we know that the name was used as key
        const newKey = WalletStorage.getKey(id)
        const newValue: StoredWallet = {
          id,
          name,
          encrypted: typeof wallet === 'string' ? wallet : JSON.stringify(wallet)
        }

        localStorage.setItem(newKey, JSON.stringify(newValue))
        localStorage.removeItem(walletOldKey)

        const addressMetadataOldKeys = [
          `${addressesMetadataPrefix}${name}`,
          `${addressesMetadataPrefix}${stringToDoubleSHA256HexString(name)}`
        ]

        addressMetadataOldKeys.forEach((oldKey) => {
          const addressesMetadataRaw = localStorage.getItem(oldKey)

          if (addressesMetadataRaw) {
            // Use new wallet ID as key to store address metadata, instead of wallet name

            let addressesMetadata = JSON.parse(addressesMetadataRaw)

            // Rename encryptedSettings property to encrypted
            if (
              typeof addressesMetadata === 'object' &&
              Object.prototype.hasOwnProperty.call(addressesMetadata, 'encryptedSettings')
            ) {
              addressesMetadata = {
                version: addressesMetadata.version,
                encrypted: addressesMetadata.encryptedSettings
              }
            }

            localStorage.setItem(AddressMetadataStorage.getKey(id), JSON.stringify(addressesMetadata))
            localStorage.removeItem(oldKey)
          }
        })
      }
    }
  }
}

// Change isMain to isDefault settings of each address and ensure it has a color
export const _20230209_124300 = () => {
  const currentAddressMetadata: (AddressMetadata | DeprecatedAddressMetadata)[] = AddressMetadataStorage.load()
  const newAddressesMetadata: AddressMetadata[] = []

  currentAddressMetadata.forEach((currentMetadata: AddressMetadata | DeprecatedAddressMetadata) => {
    let newMetadata: AddressMetadata

    if (Object.prototype.hasOwnProperty.call(currentMetadata, 'isMain')) {
      const { isMain, color, ...rest } = currentMetadata as DeprecatedAddressMetadata
      newMetadata = { ...rest, isDefault: isMain, color: color || getRandomLabelColor() } as AddressMetadata
    } else {
      newMetadata = currentMetadata as AddressMetadata
    }
    newAddressesMetadata.push(newMetadata)
  })

  AddressMetadataStorage.storeAll(newAddressesMetadata)
}
