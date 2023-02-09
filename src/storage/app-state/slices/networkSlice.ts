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

import { createListenerMiddleware, createSlice, isAnyOf, PayloadAction } from '@reduxjs/toolkit'

import SettingsStorage, { networkPresets } from '@/storage/persistent-storage/settingsPersistentStorage'
import { NetworkName, NetworkPreset, NetworkStatus } from '@/types/network'
import { NetworkSettings } from '@/types/settings'
import { getNetworkName } from '@/utils/settings'

import { RootState } from '../store'

const sliceName = 'network'

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

const parseSettingsUpdate = (settings: NetworkSettings) => {
  const missingNetworkSettings = !settings.nodeHost || !settings.explorerApiHost

  return {
    name: getNetworkName(settings),
    settings,
    status: missingNetworkSettings ? ('offline' as NetworkStatus) : ('connecting' as NetworkStatus)
  }
}

const networkSlice = createSlice({
  name: sliceName,
  initialState,
  reducers: {
    networkPresetSwitched: (_, action: PayloadAction<NetworkPreset>) => {
      const networkName = action.payload

      return {
        name: networkName,
        settings: networkPresets[networkName],
        status: 'connecting'
      }
    },
    customNetworkSettingsSaved: (_, action: PayloadAction<NetworkSettings>) => parseSettingsUpdate(action.payload),
    networkSettingsMigrated: (_, action: PayloadAction<NetworkSettings>) => parseSettingsUpdate(action.payload),
    apiClientInitSucceeded: (state) => {
      state.status = 'online'
    },
    apiClientInitFailed: (state) => {
      state.status = 'offline'
    }
  }
})

export const {
  networkSettingsMigrated,
  networkPresetSwitched,
  apiClientInitSucceeded,
  apiClientInitFailed,
  customNetworkSettingsSaved
} = networkSlice.actions

export const networkListenerMiddleware = createListenerMiddleware()

// When the network changes, store settings in persistent storage
networkListenerMiddleware.startListening({
  matcher: isAnyOf(networkSettingsMigrated, networkPresetSwitched, customNetworkSettingsSaved),
  effect: (_, { getState }) => {
    const state = getState() as RootState

    SettingsStorage.store('network', state[sliceName].settings)
  }
})

export default networkSlice
