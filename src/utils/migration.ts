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

import SettingsStorage, { defaultSettings } from '@/persistent-storage/settings'
import WalletStorage from '@/persistent-storage/wallet'
import { Settings, ThemeType } from '@/types/settings'

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

export const migrateWalletData = () => {
  console.log('🚚 Migrating wallet data')
  _20230124_164900()
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

export const migrateDeprecatedSettings = (): Settings => {
  const settings = SettingsStorage.loadAll()

  const deprecatedThemeSetting = window.localStorage.getItem('theme')
  deprecatedThemeSetting && window.localStorage.removeItem('theme')

  const migratedSettings = {
    network: settings.network ?? (settings as unknown as Settings['network']),
    general: deprecatedThemeSetting
      ? { ...settings.general, theme: deprecatedThemeSetting as ThemeType }
      : settings.general
  }

  if (
    settings.network.explorerApiHost === 'https://mainnet-backend.alephium.org' ||
    settings.network.explorerApiHost === 'https://backend-v18.mainnet.alephium.org'
  ) {
    migratedSettings.network.explorerApiHost = 'https://backend-v112.mainnet.alephium.org'
  } else if (
    settings.network.explorerApiHost === 'https://testnet-backend.alephium.org' ||
    settings.network.explorerApiHost === 'https://backend-v18.testnet.alephium.org'
  ) {
    migratedSettings.network.explorerApiHost = 'https://backend-v112.testnet.alephium.org'
  }

  if (settings.network.explorerUrl === 'https://explorer-v18.mainnet.alephium.org') {
    migratedSettings.network.explorerUrl = 'https://explorer.alephium.org'
  } else if (
    settings.network.explorerUrl === 'https://testnet.alephium.org' ||
    settings.network.explorerUrl === 'https://explorer-v18.testnet.alephium.org'
  ) {
    migratedSettings.network.explorerUrl = 'https://explorer.testnet.alephium.org'
  }

  if (
    settings.network.nodeHost === 'https://mainnet-wallet.alephium.org' ||
    settings.network.nodeHost === 'https://wallet-v18.mainnet.alephium.org'
  ) {
    migratedSettings.network.nodeHost = 'https://wallet-v16.mainnet.alephium.org'
  } else if (
    settings.network.nodeHost === 'https://testnet-wallet.alephium.org' ||
    settings.network.nodeHost === 'https://wallet-v18.testnet.alephium.org'
  ) {
    migratedSettings.network.nodeHost = 'https://wallet-v16.testnet.alephium.org'
  }

  const newSettings = merge({}, defaultSettings, migratedSettings)
  SettingsStorage.storeAll(newSettings)

  return newSettings
}

// Instead of storing a JSON stringified string, simply store a string
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
