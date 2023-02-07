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

import SettingsStorage, { defaultSettings, networkPresets } from '@/persistent-storage/settings'
import { Language, ThemeType } from '@/types/settings'
import { migrateDeprecatedSettings } from '@/utils/migration'
import { getNetworkName } from '@/utils/settings'

const mockSettings = {
  general: {
    theme: 'light' as ThemeType,
    walletLockTimeInMinutes: 999,
    discreetMode: false,
    passwordRequirement: false,
    language: 'en-US' as Language,
    devTools: false
  },
  network: {
    networkId: 123,
    nodeHost: 'https://node',
    explorerApiHost: 'https://explorer-backend',
    explorerUrl: 'https://explorer'
  }
}

it('Should return the network name if all settings match exactly', () => {
  expect(getNetworkName(networkPresets.localhost)).toEqual('localhost'),
    expect(getNetworkName(networkPresets.testnet)).toEqual('testnet'),
    expect(getNetworkName(networkPresets.mainnet)).toEqual('mainnet'),
    expect(getNetworkName({ nodeHost: '', explorerApiHost: '', explorerUrl: '', networkId: 0 })).toEqual('custom'),
    expect(
      getNetworkName({
        ...networkPresets.mainnet,
        nodeHost: 'https://mainnet-wallet.alephium2.org'
      })
    ).toEqual('custom')
})

it('Should load settings from local storage', () => {
  expect(SettingsStorage.loadAll()).toEqual(defaultSettings)

  localStorage.setItem('settings', JSON.stringify(mockSettings))
  expect(SettingsStorage.loadAll()).toEqual(mockSettings)
})

describe('Settings migration', () => {
  it('should migrate deprecated theme settings', () => {
    localStorage.setItem('theme', 'pink')
    expect(localStorage.getItem('theme')).toEqual('pink')
    expect(migrateDeprecatedSettings().general.theme).toEqual('pink')
    expect(SettingsStorage.loadAll().general.theme).toEqual('pink')
    expect(localStorage.getItem('theme')).toBeNull()
  })

  it('should migrate deprecated network settings', () => {
    const mainnetSettings = [
      {
        network: {
          networkId: 0,
          nodeHost: 'https://mainnet-wallet.alephium.org',
          explorerApiHost: 'https://mainnet-backend.alephium.org',
          explorerUrl: 'https://explorer.alephium.org'
        }
      },
      {
        network: {
          networkId: 0,
          nodeHost: 'https://wallet-v18.mainnet.alephium.org',
          explorerApiHost: 'https://backend-v18.mainnet.alephium.org',
          explorerUrl: 'https://explorer-v18.mainnet.alephium.org'
        }
      }
    ]

    for (const settings of mainnetSettings) {
      localStorage.setItem('settings', JSON.stringify(settings))
      const migratedSettings = migrateDeprecatedSettings()
      expect(migratedSettings.network.nodeHost).toBe('https://wallet-v16.mainnet.alephium.org')
      expect(migratedSettings.network.explorerApiHost).toBe('https://backend-v112.mainnet.alephium.org')
      expect(migratedSettings.network.explorerUrl).toBe('https://explorer.alephium.org')
      expect(migratedSettings.network.networkId).toBe(0)
    }

    const testnetSettings = [
      {
        network: {
          networkId: 1,
          nodeHost: 'https://testnet-wallet.alephium.org',
          explorerApiHost: 'https://testnet-backend.alephium.org',
          explorerUrl: 'https://testnet.alephium.org'
        }
      },
      {
        network: {
          networkId: 1,
          nodeHost: 'https://wallet-v18.testnet.alephium.org',
          explorerApiHost: 'https://backend-v18.testnet.alephium.org',
          explorerUrl: 'https://explorer-v18.testnet.alephium.org'
        }
      }
    ]

    for (const settings of testnetSettings) {
      localStorage.setItem('settings', JSON.stringify(settings))
      const migratedSettings = migrateDeprecatedSettings()
      expect(migratedSettings.network.nodeHost).toBe('https://wallet-v16.testnet.alephium.org')
      expect(migratedSettings.network.explorerApiHost).toBe('https://backend-v112.testnet.alephium.org')
      expect(migratedSettings.network.explorerUrl).toBe('https://explorer.testnet.alephium.org')
      expect(migratedSettings.network.networkId).toBe(1)
    }
  })
})

it('Should save settings in local storage', () => {
  SettingsStorage.storeAll(mockSettings)
  expect(localStorage.getItem('settings')).toEqual(JSON.stringify(mockSettings))
})

it('Should update stored settings', () => {
  const newNetworkSettings = {
    networkId: 1,
    nodeHost: 'https://node1',
    explorerApiHost: 'https://explorer-backend1',
    explorerUrl: 'https://explorer1'
  }
  SettingsStorage.store('network', newNetworkSettings)
  expect(localStorage.getItem('settings')).toEqual(JSON.stringify({ ...mockSettings, network: newNetworkSettings }))
})
