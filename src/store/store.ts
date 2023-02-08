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

import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/dist/query'

import confirmedTransactionsSlice from '@/store/confirmedTransactionsSlice'
import pendingTransactionsSlice from '@/store/pendingTransactionsSlice'
import unconfirmedTransactionsSlice from '@/store/unconfirmedTransactionsSlice'

import activeWalletSlice from './activeWalletSlice'
import addressesSlice from './addressesSlice'
import appSlice from './appSlice'
import contactsSlice from './contactsSlice'
import networkSlice, { networkListenerMiddleware } from './networkSlice'
import { priceApi } from './priceApiSlice'
import settingsSlice, { settingsListenerMiddleware } from './settingsSlice'

export const store = configureStore({
  reducer: {
    [appSlice.name]: appSlice.reducer,
    [activeWalletSlice.name]: activeWalletSlice.reducer,
    [contactsSlice.name]: contactsSlice.reducer,
    [settingsSlice.name]: settingsSlice.reducer,
    [networkSlice.name]: networkSlice.reducer,
    [addressesSlice.name]: addressesSlice.reducer,
    [confirmedTransactionsSlice.name]: confirmedTransactionsSlice.reducer,
    [unconfirmedTransactionsSlice.name]: unconfirmedTransactionsSlice.reducer,
    [pendingTransactionsSlice.name]: pendingTransactionsSlice.reducer,
    [priceApi.reducerPath]: priceApi.reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(priceApi.middleware)
      .concat(settingsListenerMiddleware.middleware)
      .concat(networkListenerMiddleware.middleware)
})

setupListeners(store.dispatch)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
