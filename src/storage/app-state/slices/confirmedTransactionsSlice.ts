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

import { Transaction } from '@alephium/sdk/api/explorer'
import { createEntityAdapter, createSelector, createSlice, EntityState, PayloadAction } from '@reduxjs/toolkit'

import { activeWalletDeleted, walletLocked, walletSwitched } from '@/storage/app-state/slices/activeWalletSlice'
import {
  selectAllAddresses,
  syncAddressesData,
  syncAddressTransactionsNextPage,
  syncAllAddressesTransactionsNextPage
} from '@/storage/app-state/slices/addressesSlice'
import { RootState } from '@/storage/app-state/store'
import { AddressDataSyncResult, AddressHash } from '@/types/addresses'
import { AddressConfirmedTransaction } from '@/types/transactions'
import { selectAddressTransactions } from '@/utils/addresses'

const sliceName = 'confirmedTransactions'

type ConfirmedTransactionsState = EntityState<Transaction>

const confirmedTransactionsAdapter = createEntityAdapter<Transaction>({
  selectId: (transaction) => transaction.hash,
  sortComparer: (a, b) => b.timestamp - a.timestamp
})

const initialState: ConfirmedTransactionsState = confirmedTransactionsAdapter.getInitialState()

const confirmedTransactionsSlice = createSlice({
  name: sliceName,
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(syncAddressesData.fulfilled, addTransactions)
      .addCase(syncAddressTransactionsNextPage.fulfilled, addTransactions)
      .addCase(syncAllAddressesTransactionsNextPage.fulfilled, addTransactions)
      .addCase(walletLocked, () => initialState)
      .addCase(walletSwitched, () => initialState)
      .addCase(activeWalletDeleted, () => initialState)
  }
})

export const { selectAll: selectAllConfirmedTransactions } = confirmedTransactionsAdapter.getSelectors<RootState>(
  (state) => state[sliceName]
)

export const selectAddressesConfirmedTransactions = createSelector(
  [selectAllAddresses, selectAllConfirmedTransactions, (_, addressHashes: AddressHash[]) => addressHashes],
  (allAddresses, confirmedTransactions, addressHashes): AddressConfirmedTransaction[] =>
    selectAddressTransactions(allAddresses, confirmedTransactions, addressHashes) as AddressConfirmedTransaction[]
)

export default confirmedTransactionsSlice

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
