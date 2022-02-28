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

import { ThemeType } from '../style/themes'
import {
  defaultSettings,
  deprecatedSettingsExist,
  getNetworkName,
  loadSettings,
  migrateDeprecatedSettings,
  networkEndpoints,
  storeSettings,
  updateStoredSettings
} from '../utils/settings'

const mockSettings = {
  general: {
    theme: 'light' as ThemeType,
    walletLockTimeInMinutes: 999,
    discreetMode: false,
    passwordRequirement: false
  },
  network: {
    nodeHost: 'https://node',
    explorerApiHost: 'https://explorer-backend',
    explorerUrl: 'https://explorer'
  }
}

it('Should return the network name if all settings match exactly', () => {
  expect(getNetworkName(networkEndpoints.localhost)).toEqual('localhost'),
    expect(getNetworkName(networkEndpoints.testnet)).toEqual('testnet'),
    expect(getNetworkName(networkEndpoints.mainnet)).toEqual('mainnet'),
    expect(getNetworkName({ nodeHost: '', explorerApiHost: '', explorerUrl: '' })).toEqual('custom'),
    expect(
      getNetworkName({
        ...networkEndpoints.mainnet,
        nodeHost: 'https://mainnet-wallet.alephium2.org'
      })
    ).toEqual('custom')
})

it('Should load settings from local storage', () => {
  expect(loadSettings()).toEqual(defaultSettings)

  localStorage.setItem('settings', JSON.stringify(mockSettings))
  expect(loadSettings()).toEqual(mockSettings)
})

it('Should migrate deprecated settings', () => {
  localStorage.setItem('theme', 'pink')
  expect(localStorage.getItem('theme')).toEqual('pink')
  expect(migrateDeprecatedSettings().general.theme).toEqual('pink')
  expect(loadSettings().general.theme).toEqual('pink')
  expect(localStorage.getItem('theme')).toBeNull()
})

it('Should save settings in local storage', () => {
  storeSettings(mockSettings)
  expect(localStorage.getItem('settings')).toEqual(JSON.stringify(mockSettings))
})

it('Should update stored settings', () => {
  const newNetworkSettings = {
    nodeHost: 'https://node1',
    explorerApiHost: 'https://explorer-backend1',
    explorerUrl: 'https://explorer1'
  }
  updateStoredSettings('network', newNetworkSettings)
  expect(localStorage.getItem('settings')).toEqual(JSON.stringify({ ...mockSettings, network: newNetworkSettings }))
})

it('Should indicate that there are deprecated settings stored in local storage', () => {
  expect(deprecatedSettingsExist()).toBeFalsy()
  localStorage.setItem('theme', 'pink')
  expect(deprecatedSettingsExist()).toBeTruthy()
})
