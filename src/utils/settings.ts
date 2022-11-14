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

import { clone, merge } from 'lodash'

import { Language, ThemeType } from '../types/settings'

export interface Settings {
  general: {
    theme: ThemeType
    walletLockTimeInMinutes: number | null
    discreetMode: boolean
    passwordRequirement: boolean
    language: Language
  }
  network: {
    networkId: number
    nodeHost: string
    explorerApiHost: string
    explorerUrl: string
  }
}

export type UpdateSettingsFunctionSignature = <T extends keyof Settings>(
  settingKeyToUpdate: T,
  newSettings: Partial<Settings[T]>
) => Settings | null

type DeprecatedNetworkSettings = Settings['network']

export const networkEndpoints: Record<Exclude<NetworkName, 'custom'>, Settings['network']> = {
  mainnet: {
    networkId: 0,
    nodeHost: 'https://wallet-v15.mainnet.alephium.org',
    explorerApiHost: 'https://backend-v19.mainnet.alephium.org',
    explorerUrl: 'https://explorer-v19.mainnet.alephium.org'
  },
  testnet: {
    networkId: 1,
    nodeHost: 'https://wallet.testnet.alephium.org',
    explorerApiHost: 'https://backend.testnet.alephium.org',
    explorerUrl: 'https://explorer.testnet.alephium.org'
  },
  localhost: {
    networkId: 4,
    nodeHost: 'http://localhost:12973',
    explorerApiHost: 'http://localhost:9090',
    explorerUrl: 'http://localhost:3000'
  }
}

export const defaultSettings: Settings = {
  general: {
    theme: 'light',
    walletLockTimeInMinutes: 3,
    discreetMode: false,
    passwordRequirement: false,
    language: 'en-US'
  },
  network: clone(networkEndpoints.mainnet) as Settings['network']
}

export const networkNames = ['mainnet', 'testnet', 'localhost', 'custom'] as const

export type NetworkName = typeof networkNames[number]

export const isEqualNetwork = (a: Settings['network'], b: Settings['network']): boolean =>
  a.nodeHost === b.nodeHost && a.explorerUrl === b.explorerUrl && a.explorerApiHost === b.explorerApiHost

export const getNetworkName = (settings: Settings['network']) =>
  (Object.entries(networkEndpoints).find(([, presetSettings]) => isEqualNetwork(presetSettings, settings))?.[0] ||
    'custom') as NetworkName | 'custom'

export const loadSettings = (): Settings => {
  const rawSettings = window.localStorage.getItem('settings')

  if (!rawSettings) return defaultSettings

  try {
    // Merge default settings with rawSettings in case of new key(s) being added
    const parsedSettings = JSON.parse(rawSettings) as Settings

    return merge(defaultSettings, parsedSettings)
  } catch (e) {
    console.error(e)
    return defaultSettings // Fallback to default settings if something went wrong
  }
}

export const migrateDeprecatedSettings = (): Settings => {
  const settings = loadSettings()

  const deprecatedThemeSetting = window.localStorage.getItem('theme')
  deprecatedThemeSetting && window.localStorage.removeItem('theme')

  const migratedSettings = {
    network: settings.network ?? (settings as unknown as DeprecatedNetworkSettings),
    general: deprecatedThemeSetting
      ? { ...settings.general, theme: deprecatedThemeSetting as ThemeType }
      : settings.general
  }

  if (
    settings.network.explorerApiHost === 'https://mainnet-backend.alephium.org' ||
    settings.network.explorerApiHost === 'https://backend-v18.mainnet.alephium.org'
  ) {
    migratedSettings.network.explorerApiHost = 'https://backend-v19.mainnet.alephium.org'
  } else if (
    settings.network.explorerApiHost === 'https://testnet-backend.alephium.org' ||
    settings.network.explorerApiHost === 'https://backend-v18.testnet.alephium.org'
  ) {
    migratedSettings.network.explorerApiHost = 'https://backend.testnet.alephium.org'
  }

  if (
    settings.network.explorerUrl === 'https://explorer.alephium.org' ||
    settings.network.explorerUrl === 'https://explorer-v18.mainnet.alephium.org'
  ) {
    migratedSettings.network.explorerUrl = 'https://explorer-v19.mainnet.alephium.org'
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
    migratedSettings.network.nodeHost = 'https://wallet-v15.mainnet.alephium.org'
  } else if (
    settings.network.nodeHost === 'https://testnet-wallet.alephium.org' ||
    settings.network.nodeHost === 'https://wallet-v18.testnet.alephium.org'
  ) {
    migratedSettings.network.nodeHost = 'https://wallet.testnet.alephium.org'
  }

  const newSettings = merge({}, defaultSettings, migratedSettings)
  storeSettings(newSettings)

  return newSettings
}

export const storeSettings = (settings: Settings) => {
  window.localStorage.setItem('settings', JSON.stringify(settings))
}

export const updateStoredSettings: UpdateSettingsFunctionSignature = (settingKeyToUpdate, settings) => {
  const rawPreviousSettings = window.localStorage.getItem('settings')
  const previousSettings = rawPreviousSettings && JSON.parse(rawPreviousSettings)

  const newSettings = {
    ...previousSettings,
    [settingKeyToUpdate]: {
      ...previousSettings[settingKeyToUpdate],
      ...settings
    }
  }

  window.localStorage.setItem('settings', JSON.stringify(newSettings))

  return newSettings
}
