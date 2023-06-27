/*
Copyright 2018 - 2023 The Alephium Authors
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
import posthog from 'posthog-js'

import { NetworkPreset } from '@/types/network'
import { NetworkSettings, Settings } from '@/types/settings'

export const networkPresets: Record<NetworkPreset, NetworkSettings> = {
  mainnet: {
    networkId: 0,
    nodeHost: 'https://wallet-v20.mainnet.alephium.org',
    explorerApiHost: 'https://backend-v113.mainnet.alephium.org',
    explorerUrl: 'https://explorer.alephium.org'
  },
  testnet: {
    networkId: 1,
    nodeHost: 'https://wallet-v20.testnet.alephium.org',
    explorerApiHost: 'https://backend-v113.testnet.alephium.org',
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
    theme: 'system',
    walletLockTimeInMinutes: 3,
    discreetMode: false,
    passwordRequirement: false,
    language: undefined,
    devTools: false,
    analytics: true,
    fiatCurrency: 'USD'
  },
  network: clone(networkPresets.mainnet) as NetworkSettings
}

type SettingsKey = keyof Settings

class SettingsStorage {
  private static localStorageKey = 'settings'

  loadAll(): Settings {
    const rawSettings = window.localStorage.getItem(SettingsStorage.localStorageKey)

    if (!rawSettings) return defaultSettings

    try {
      // Merge default settings with rawSettings in case of new key(s) being added
      const parsedSettings = JSON.parse(rawSettings) as Settings

      return merge({}, defaultSettings, parsedSettings)
    } catch (e) {
      console.error(e)
      posthog.capture('Error', { message: 'Parsing stored settings' })
      return defaultSettings // Fallback to default settings if something went wrong
    }
  }

  load(key: SettingsKey): Settings[SettingsKey] {
    const settings = this.loadAll()

    return settings[key]
  }

  storeAll(settings: Settings) {
    window.localStorage.setItem(SettingsStorage.localStorageKey, JSON.stringify(settings))
  }

  store<K extends SettingsKey, S extends Settings[K]>(key: K, settings: S) {
    const previousSettings = this.loadAll()

    const newSettings = {
      ...previousSettings,
      [key]: {
        ...previousSettings[key],
        ...settings
      }
    }

    this.storeAll(newSettings)

    return newSettings
  }
}

const Storage = new SettingsStorage()

export default Storage
