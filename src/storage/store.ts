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

import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/dist/query'

import addressesSlice from '@/storage/addresses/addressesSlice'
import contactsSlice from '@/storage/addresses/contactsSlice'
import assetsInfoSlice from '@/storage/assets/assetsInfoSlice'
import nftsSlice from '@/storage/assets/nftsSlice'
import { priceApi } from '@/storage/assets/priceApiSlice'
import globalSlice from '@/storage/global/globalSlice'
import snackbarSlice from '@/storage/global/snackbarSlice'
import networkSlice, { networkListenerMiddleware } from '@/storage/settings/networkSlice'
import settingsSlice, { settingsListenerMiddleware } from '@/storage/settings/settingsSlice'
import confirmedTransactionsSlice from '@/storage/transactions/confirmedTransactionsSlice'
import pendingTransactionsSlice, {
  pendingTransactionsListenerMiddleware
} from '@/storage/transactions/pendingTransactionsSlice'
import activeWalletSlice from '@/storage/wallets/activeWalletSlice'

export const store = configureStore({
  reducer: {
    [globalSlice.name]: globalSlice.reducer,
    [activeWalletSlice.name]: activeWalletSlice.reducer,
    [contactsSlice.name]: contactsSlice.reducer,
    [settingsSlice.name]: settingsSlice.reducer,
    [networkSlice.name]: networkSlice.reducer,
    [addressesSlice.name]: addressesSlice.reducer,
    [confirmedTransactionsSlice.name]: confirmedTransactionsSlice.reducer,
    [pendingTransactionsSlice.name]: pendingTransactionsSlice.reducer,
    [assetsInfoSlice.name]: assetsInfoSlice.reducer,
    [snackbarSlice.name]: snackbarSlice.reducer,
    [priceApi.reducerPath]: priceApi.reducer,
    [nftsSlice.name]: nftsSlice.reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(priceApi.middleware)
      .concat(settingsListenerMiddleware.middleware)
      .concat(networkListenerMiddleware.middleware)
      .concat(pendingTransactionsListenerMiddleware.middleware)
})

setupListeners(store.dispatch)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
