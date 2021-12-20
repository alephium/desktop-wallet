// Copyright 2018 - 2021 The Alephium Authors
// This file is part of the alephium project.
//
// The library is free software: you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// The library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public License
// along with the library. If not, see <http://www.gnu.org/licenses/>.

import { isEqual } from 'lodash'
import { useContext } from 'react'

import { GlobalContext } from '../App'
import { ThemeType } from '../style/themes'

export interface Settings {
  general: {
    theme: ThemeType
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

export const walletIdleForTooLongThreshold = 3 * 60 * 1000 // 3 minutes

export const defaultSettings: Settings = { general: { theme: 'light' }, network: networkEndpoints.mainnet }

export const networkTypes = ['testnet', 'mainnet', 'localhost', 'custom'] as const

export type NetworkType = typeof networkTypes[number]

export const getNetworkName = (settings: Settings['network']) => {
  return (Object.entries(networkEndpoints).find(([, presetSettings]) => {
    return isEqual(presetSettings, settings)
  })?.[0] || 'custom') as NetworkType | 'custom'
}

export const useCurrentNetwork = () => {
  const { settings } = useContext(GlobalContext)
  return getNetworkName(settings.network)
}

const returnSettingsObject = () => {
  const rawSettings = window.localStorage.getItem('settings')

  if (!rawSettings) return defaultSettings

  try {
    return JSON.parse(rawSettings) as Settings
  } catch (e) {
    console.error(e)
    return defaultSettings // Fallback to default settings if something went wrong
  }
}

export const loadStoredSettings = (): Settings => {
  const storedSettings = returnSettingsObject()

  const deprecatedThemeSetting = window.localStorage.getItem('theme')

  // Migrate values if needed
  const migratedNetworkSettings = !storedSettings.network
    ? { network: storedSettings as unknown as DeprecatedNetworkSettings }
    : {}
  const migratedGeneralSettings = deprecatedThemeSetting
    ? {
        general: {
          theme: deprecatedThemeSetting as ThemeType
        }
      }
    : {}

  // Clean old values up if needed
  deprecatedThemeSetting && window.localStorage.removeItem('theme')

  return {
    ...defaultSettings,
    ...storedSettings,
    ...migratedNetworkSettings,
    ...migratedGeneralSettings
  }
}

export const saveStoredSettings = (settings: Settings) => {
  const str = JSON.stringify(settings)
  window.localStorage.setItem('settings', str)
}

export const getStoredSettings = <T extends keyof Settings>(key: T): Settings[T] => {
  return returnSettingsObject()[key]
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
