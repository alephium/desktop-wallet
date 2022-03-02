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

import { clone, isEqual, merge } from 'lodash'

import { ThemeType } from '../style/themes'

export interface Settings {
  general: {
    theme: ThemeType
    walletLockTimeInMinutes: number | null
    discreetMode: boolean
    passwordRequirement: boolean
  }
  network: {
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

export const networkEndpoints: Record<Exclude<NetworkType, 'custom'>, Settings['network']> = {
  mainnet: {
    nodeHost: 'https://mainnet-wallet.alephium.org',
    explorerApiHost: 'https://mainnet-backend.alephium.org',
    explorerUrl: 'https://explorer.alephium.org'
  },
  testnet: {
    nodeHost: 'https://testnet-wallet.alephium.org',
    explorerApiHost: 'https://testnet-backend.alephium.org',
    explorerUrl: 'https://testnet.alephium.org'
  },
  localhost: {
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
    passwordRequirement: false
  },
  network: clone(networkEndpoints.mainnet)
}

export const networkTypes = ['testnet', 'mainnet', 'localhost', 'custom'] as const

export type NetworkType = typeof networkTypes[number]

export const getNetworkName = (settings: Settings['network']) => {
  return (Object.entries(networkEndpoints).find(([, presetSettings]) => {
    return isEqual(presetSettings, settings)
  })?.[0] || 'custom') as NetworkType | 'custom'
}

export const loadSettings = (): Settings => {
  const rawSettings = window.localStorage.getItem('settings')

  if (!rawSettings) return defaultSettings

  try {
    return JSON.parse(rawSettings) as Settings
  } catch (e) {
    console.error(e)
    return defaultSettings // Fallback to default settings if something went wrong
  }
}

export const deprecatedSettingsExist = (): boolean => {
  return !!window.localStorage.getItem('theme')
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
