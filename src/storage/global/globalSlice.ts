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

import { createSelector, createSlice } from '@reduxjs/toolkit'

import { addressDiscoveryFinished, addressDiscoveryStarted } from '@/storage/addresses/addressesActions'
import {
  addressesPageInfoMessageClosed,
  devModeShortcutDetected,
  localStorageDataMigrated,
  modalClosed,
  modalOpened,
  osThemeChangeDetected,
  transfersPageInfoMessageClosed
} from '@/storage/global/globalActions'
import { languageChangeFinished, languageChangeStarted, themeToggled } from '@/storage/settings/settingsActions'
import { themeSettingsChanged } from '@/storage/settings/settingsActions'
import { RootState } from '@/storage/store'
import { activeWalletDeleted, newWalletNameStored, walletLocked, walletSaved } from '@/storage/wallets/walletActions'
import { walletDeleted } from '@/storage/wallets/walletActions'
import WalletStorage from '@/storage/wallets/walletPersistentStorage'
import { ThemeType } from '@/types/settings'
import { StoredWallet } from '@/types/wallet'
import { getThemeType } from '@/utils/settings'

interface AppState {
  loading: boolean
  visibleModals: string[]
  addressesPageInfoMessageClosed: boolean
  transfersPageInfoMessageClosed: boolean
  wallets: StoredWallet[]
  theme: ThemeType
  devMode: boolean
}

const initialState: AppState = {
  loading: false,
  visibleModals: [],
  addressesPageInfoMessageClosed: true, // See: https://github.com/alephium/desktop-wallet/issues/644
  transfersPageInfoMessageClosed: true, // See: https://github.com/alephium/desktop-wallet/issues/644
  wallets: WalletStorage.list(),
  theme: getThemeType(),
  devMode: false
}

const globalSlice = createSlice({
  name: 'global',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(modalOpened, (state, action) => {
        const modalId = action.payload

        state.visibleModals.push(modalId)
      })
      .addCase(modalClosed, (state) => {
        state.visibleModals.pop()
      })
      .addCase(addressesPageInfoMessageClosed, (state) => {
        state.addressesPageInfoMessageClosed = true
      })
      .addCase(transfersPageInfoMessageClosed, (state) => {
        state.transfersPageInfoMessageClosed = true
      })
      .addCase(walletDeleted, (state, action) => {
        const deletedWalletId = action.payload

        state.wallets = state.wallets.filter(({ id }) => id !== deletedWalletId)
      })
      .addCase(osThemeChangeDetected, (state, action) => {
        state.theme = action.payload
      })
      .addCase(devModeShortcutDetected, (state, action) => {
        state.devMode = action.payload.activate
      })
      .addCase(addressDiscoveryStarted, (state, action) => toggleLoading(state, true, action.payload))
      .addCase(addressDiscoveryFinished, (state, action) => toggleLoading(state, false, action.payload))
      .addCase(languageChangeStarted, (state) => toggleLoading(state, true, true))
      .addCase(languageChangeFinished, (state) => toggleLoading(state, false, true))
      .addCase(walletSaved, (state, action) => {
        const { id, name, encrypted, lastUsed } = action.payload.wallet

        state.wallets.push({ id, name, encrypted, lastUsed })
      })
      .addCase(walletLocked, resetState)
      .addCase(activeWalletDeleted, resetState)
      .addCase(themeSettingsChanged, (state, action) => {
        const theme = action.payload
        if (theme !== 'system') state.theme = theme
      })
      .addCase(themeToggled, (state, action) => {
        state.theme = action.payload
      })
      .addCase(localStorageDataMigrated, refreshWalletList)
      .addCase(newWalletNameStored, refreshWalletList)
  }
})

export const selectDevModeStatus = createSelector(
  (s: RootState) => s.global.devMode,
  (devMode) => devMode && import.meta.env.DEV
)

export default globalSlice

// Reducers helper functions

const toggleLoading = (state: AppState, toggle: boolean, enableLoading?: boolean) => {
  if (enableLoading !== false) state.loading = toggle
}

const resetState = () => ({ ...initialState, wallets: WalletStorage.list(), theme: getThemeType() })

const refreshWalletList = (state: AppState) => {
  state.wallets = WalletStorage.list()
}
