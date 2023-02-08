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

import { walletLocked, walletSwitched } from '@/store/activeWalletSlice'

import { AddressDataSyncResult, AddressHash } from '../types/addresses'
import { AddressPendingTransaction, PendingTransaction } from '../types/transactions'
import { selectAddressTransactions } from '../utils/addresses'
import {
  selectAllAddresses,
  syncAddressesData,
  syncAddressTransactionsNextPage,
  syncAllAddressesTransactionsNextPage,
  transactionSent
} from './addressesSlice'
import { RootState } from './store'

const sliceName = 'pendingTransactions'

const pendingTransactionsAdapter = createEntityAdapter<PendingTransaction>({
  selectId: (transaction) => transaction.hash,
  sortComparer: (a, b) => b.timestamp - a.timestamp
})

type PendingTransactionsState = EntityState<PendingTransaction>

const initialState: PendingTransactionsState = pendingTransactionsAdapter.getInitialState()

const pendingTransactionsSlice = createSlice({
  name: sliceName,
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(transactionSent, pendingTransactionsAdapter.addOne)
      .addCase(syncAddressesData.fulfilled, removeTransactions)
      .addCase(syncAddressTransactionsNextPage.fulfilled, removeTransactions)
      .addCase(syncAllAddressesTransactionsNextPage.fulfilled, removeTransactions)
      .addCase(walletLocked, () => initialState)
      .addCase(walletSwitched, () => initialState)
  }
})

export const { selectAll: selectAllPendingTransactions } = pendingTransactionsAdapter.getSelectors<RootState>(
  (state) => state[sliceName]
)

export const selectAddressesPendingTransactions = createSelector(
  [selectAllAddresses, selectAllPendingTransactions, (_, addressHashes: AddressHash[]) => addressHashes],
  (allAddresses, pendingTransactions, addressHashes): AddressPendingTransaction[] =>
    selectAddressTransactions(allAddresses, pendingTransactions, addressHashes) as AddressPendingTransaction[]
)

export default pendingTransactionsSlice

const removeTransactions = (
  state: PendingTransactionsState,
  action: PayloadAction<AddressDataSyncResult[] | { transactions: Transaction[] } | undefined>
) => {
  const transactions = Array.isArray(action.payload)
    ? [
        ...action.payload.flatMap((address) => address.transactions),
        ...action.payload.flatMap((address) => address.unconfirmedTransactions)
      ]
    : action.payload?.transactions

  if (transactions && transactions.length > 0) {
    pendingTransactionsAdapter.removeMany(
      state,
      transactions.map((tx) => tx.hash)
    )
  }
}
