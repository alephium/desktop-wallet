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

import AddressMetadataStorage from '@/storage/persistent-storage/addressMetadataPersistentStorage'
import { DataKey } from '@/storage/persistent-storage/encryptedPersistentStorage'
import SettingsStorage, {
  defaultSettings,
  networkPresets
} from '@/storage/persistent-storage/settingsPersistentStorage'
import WalletStorage from '@/storage/persistent-storage/walletPersistentStorage'
import { AddressMetadata, DeprecatedAddressMetadata } from '@/types/addresses'
import { GeneralSettings, NetworkSettings, ThemeType } from '@/types/settings'
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
export const migrateUserData = (mnemonic: string, walletName: string) => {
  console.log('🚚 Migrating user data')

  _20220511_074100()
  _20220527_120000({ mnemonic, walletName })
  _20230209_124300({ mnemonic, walletName })
}

export const migrateWalletData = () => {
  console.log('🚚 Migrating wallet data')

  _20230124_164900()
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
  _v200_networkSettingsMigration()

  return SettingsStorage.load('network') as NetworkSettings
}

// Change localStorage address metadata key from "{walletName}-addresses-metadata" to "addresses-metadata-{walletName}"
// See https://github.com/alephium/desktop-wallet/issues/236
export const _20220511_074100 = () => {
  const walletNames = WalletStorage.list()

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
export const _20220527_120000 = ({ mnemonic, walletName }: DataKey) => {
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

export const _v200_networkSettingsMigration = () => {
  // TODO: Implement after merging master into v2.0 and write tests
}

// Instead of storing the wallet as a JSON stringified string, simply store a string
export const _20230124_164900 = () => {
  WalletStorage.list().forEach((name) => {
    const wallet = window.localStorage.getItem(WalletStorage.getKey(name))

    if (!wallet) return

    const parsedWallet = JSON.parse(wallet)

    if (typeof parsedWallet === 'string') {
      window.localStorage.setItem(WalletStorage.getKey(name), parsedWallet)
    }
  })
}

// Change isMain to isDefault settings of each address and ensure it has a color
export const _20230209_124300 = (dataKey: DataKey) => {
  const currentAddressMetadata: (AddressMetadata | DeprecatedAddressMetadata)[] = AddressMetadataStorage.load(dataKey)
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

  AddressMetadataStorage.storeAll({ addressesMetadata: newAddressesMetadata, dataKey })
}
