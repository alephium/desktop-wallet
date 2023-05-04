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

import { Transaction } from '@alephium/sdk/api/explorer'
import { createSlice, EntityState, PayloadAction } from '@reduxjs/toolkit'

import {
  newAddressesSaved,
  syncAddressesData,
  syncAddressTransactionsNextPage,
  syncAllAddressesTransactionsNextPage
} from '@/storage/addresses/addressesActions'
import { confirmedTransactionsAdapter } from '@/storage/transactions/transactionsAdapters'
import { activeWalletDeleted, walletLocked, walletSwitched } from '@/storage/wallets/walletActions'
import { AddressDataSyncResult } from '@/types/addresses'

interface ConfirmedTransactionsState extends EntityState<Transaction> {
  allLoaded: boolean
  pageLoaded: number
}

const initialState: ConfirmedTransactionsState = confirmedTransactionsAdapter.getInitialState({
  allLoaded: false,
  pageLoaded: 0
})

const confirmedTransactionsSlice = createSlice({
  name: 'confirmedTransactions',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(syncAddressesData.fulfilled, addTransactions)
      .addCase(syncAddressTransactionsNextPage.fulfilled, addTransactions)
      .addCase(syncAllAddressesTransactionsNextPage.fulfilled, (state, action) => {
        const { transactions, pageLoaded } = action.payload

        if (transactions.length > 0) {
          state.pageLoaded = pageLoaded
        } else {
          state.allLoaded = true
        }

        addTransactions(state, action)
      })
      .addCase(walletLocked, resetState)
      .addCase(walletSwitched, resetState)
      .addCase(activeWalletDeleted, resetState)
      .addCase(newAddressesSaved, resetLoadedPages)
  }
})

export default confirmedTransactionsSlice

// Reducers helper functions

const addTransactions = (
  state: ConfirmedTransactionsState,
  action: PayloadAction<AddressDataSyncResult[] | { transactions: Transaction[] } | undefined>
) => {
  const transactions = Array.isArray(action.payload)
    ? action.payload.flatMap((address) => address.transactions)
    : action.payload?.transactions

  if (transactions && transactions.length > 0) {
    confirmedTransactionsAdapter.upsertMany(state, transactions)
  }
}

const resetState = () => initialState

const resetLoadedPages = (state: ConfirmedTransactionsState) => {
  state.pageLoaded = 0
  state.allLoaded = false
}
