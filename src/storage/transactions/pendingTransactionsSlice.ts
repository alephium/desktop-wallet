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
import { createSlice, EntityState, PayloadAction } from '@reduxjs/toolkit'

import {
  syncAddressesData,
  syncAddressTransactionsNextPage,
  syncAllAddressesTransactionsNextPage
} from '@/storage/addresses/addressesActions'
import { transactionSent } from '@/storage/transactions/transactionsActions'
import { pendingTransactionsAdapter } from '@/storage/transactions/transactionsAdapters'
import { activeWalletDeleted, walletLocked, walletSwitched } from '@/storage/wallets/walletActions'
import { AddressDataSyncResult } from '@/types/addresses'
import { PendingTransaction } from '@/types/transactions'
import { convertUnconfirmedTxToPendingTx } from '@/utils/transactions'

type PendingTransactionsState = EntityState<PendingTransaction>

const initialState: PendingTransactionsState = pendingTransactionsAdapter.getInitialState()

const pendingTransactionsSlice = createSlice({
  name: 'pendingTransactions',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(transactionSent, pendingTransactionsAdapter.addOne)
      .addCase(syncAddressesData.fulfilled, updateTransactions)
      .addCase(syncAddressTransactionsNextPage.fulfilled, removeTransactions)
      .addCase(syncAllAddressesTransactionsNextPage.fulfilled, removeTransactions)
      .addCase(walletLocked, () => initialState)
      .addCase(walletSwitched, () => initialState)
      .addCase(activeWalletDeleted, () => initialState)
  }
})

export default pendingTransactionsSlice

// Reducers helper functions

const updateTransactions = (state: PendingTransactionsState, action: PayloadAction<AddressDataSyncResult[]>) => {
  const addresses = action.payload
  const confirmedTransactionsHashes = addresses.flatMap((address) => address.transactions).map((tx) => tx.hash)

  // Converting unconfirmed txs to pending txs because the amount delta calculation doesn't work for unconfirmed txs.
  // See: https://github.com/alephium/explorer-backend/issues/360
  const pendingTransactions = addresses
    .flatMap((address) => address.mempoolTransactions.map((tx) => ({ tx, address: address.hash })))
    .map(({ tx, address }) => convertUnconfirmedTxToPendingTx(tx, address))

  pendingTransactionsAdapter.removeMany(state, confirmedTransactionsHashes)
  pendingTransactionsAdapter.upsertMany(state, pendingTransactions)
}

const removeTransactions = (
  state: PendingTransactionsState,
  action: PayloadAction<{ transactions: Transaction[] } | undefined>
) => {
  const transactions = Array.isArray(action.payload)
    ? action.payload.flatMap((address) => address.transactions)
    : action.payload?.transactions

  if (transactions && transactions.length > 0) {
    pendingTransactionsAdapter.removeMany(
      state,
      transactions.map((tx) => tx.hash)
    )
  }
}
