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

import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import WalletStorage from '@/persistent-storage/wallet'
import { addressDiscoveryFinished, addressDiscoveryStarted } from '@/store/addressesSlice'

import { languageChangeFinished, languageChangeStarted } from './actions'
import { walletDeleted, walletLocked, walletSaved } from './activeWalletSlice'

const sliceName = 'app'

interface AppState {
  loading: boolean
  visibleModals: string[]
  addressesPageInfoMessageClosed: boolean
  storedWalletNames: string[]
}

const initialState: AppState = {
  loading: false,
  visibleModals: [],
  addressesPageInfoMessageClosed: false,
  storedWalletNames: WalletStorage.list()
}

const appSlice = createSlice({
  name: sliceName,
  initialState,
  reducers: {
    appLoadingToggled: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    modalOpened: (state, action: PayloadAction<string>) => {
      const modalId = action.payload

      state.visibleModals.push(modalId)
    },
    modalClosed: (state) => {
      state.visibleModals.pop()
    },
    addressesPageInfoMessageClosed: (state) => {
      state.addressesPageInfoMessageClosed = true
    }
  },
  extraReducers(builder) {
    builder
      .addCase(addressDiscoveryStarted, (state, action) => toggleLoading(state, true, action.payload))
      .addCase(addressDiscoveryFinished, (state, action) => toggleLoading(state, false, action.payload))
      .addCase(languageChangeStarted, (state) => {
        state.loading = true
      })
      .addCase(languageChangeFinished, (state) => {
        state.loading = false
      })
      .addCase(walletLocked, () => initialState)
      .addCase(walletSaved, (state, action) => {
        const newWallet = action.payload

        state.storedWalletNames.push(newWallet.name)
      })
      .addCase(walletDeleted, (state, action) => {
        const deletedWalletName = action.payload

        state.storedWalletNames = state.storedWalletNames.filter((walletName) => walletName !== deletedWalletName)
      })
  }
})

export const { appLoadingToggled, modalOpened, modalClosed, addressesPageInfoMessageClosed } = appSlice.actions

export default appSlice

const toggleLoading = (state: AppState, toggle: boolean, enableLoading?: boolean) => {
  if (enableLoading !== false) state.loading = toggle
}
