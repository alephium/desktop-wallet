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

export const loadSettings = (): Settings => {
  const rawStoredSettings = window.localStorage.getItem('settings')

  if (!rawStoredSettings) return defaultSettings

  const storedSettings = JSON.parse(rawStoredSettings)

  const deprecatedThemeSetting = window.localStorage.getItem('theme')

  // Migrate values if needed
  const migratedNetworkSettings = !storedSettings.network ? { network: storedSettings as Settings['network'] } : {}
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

export function saveSettings(settings: Settings) {
  const str = JSON.stringify(settings)
  window.localStorage.setItem('settings', str)
}
