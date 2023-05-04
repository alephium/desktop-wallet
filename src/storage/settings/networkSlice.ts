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

import { createListenerMiddleware, createSlice, isAnyOf } from '@reduxjs/toolkit'

import { localStorageDataMigrated } from '@/storage/global/globalActions'
import {
  apiClientInitFailed,
  apiClientInitSucceeded,
  customNetworkSettingsSaved,
  networkPresetSwitched
} from '@/storage/settings/networkActions'
import SettingsStorage, { networkPresets } from '@/storage/settings/settingsPersistentStorage'
import { RootState } from '@/storage/store'
import { NetworkName, NetworkStatus } from '@/types/network'
import { NetworkSettings } from '@/types/settings'
import { getNetworkName } from '@/utils/settings'

interface NetworkState {
  name: NetworkName
  settings: NetworkSettings
  status: NetworkStatus
}

const storedNetworkSettings = SettingsStorage.load('network') as NetworkSettings

const initialState: NetworkState = {
  name: getNetworkName(storedNetworkSettings),
  settings: storedNetworkSettings,
  status: 'uninitialized'
}

const networkSlice = createSlice({
  name: 'network',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(localStorageDataMigrated, () => parseSettingsUpdate(SettingsStorage.load('network') as NetworkSettings))
      .addCase(customNetworkSettingsSaved, (_, action) => parseSettingsUpdate(action.payload))
      .addCase(networkPresetSwitched, (_, action) => {
        const networkName = action.payload

        return {
          name: networkName,
          settings: networkPresets[networkName],
          status: 'connecting'
        }
      })
      .addCase(apiClientInitSucceeded, (state, action) => {
        state.settings.networkId = action.payload.networkId
        state.status = 'online'
      })
      .addCase(apiClientInitFailed, (state) => {
        state.status = 'offline'
      })
  }
})

export const networkListenerMiddleware = createListenerMiddleware()

// When the network changes, store settings in persistent storage
networkListenerMiddleware.startListening({
  matcher: isAnyOf(networkPresetSwitched, customNetworkSettingsSaved, apiClientInitSucceeded),
  effect: (_, { getState }) => {
    const state = getState() as RootState

    SettingsStorage.store('network', state.network.settings)
  }
})

export default networkSlice

// Reducers helper function

const parseSettingsUpdate = (settings: NetworkSettings) => {
  const missingNetworkSettings = !settings.nodeHost || !settings.explorerApiHost

  return {
    name: getNetworkName(settings),
    settings,
    status: missingNetworkSettings ? ('offline' as NetworkStatus) : ('connecting' as NetworkStatus)
  }
}
