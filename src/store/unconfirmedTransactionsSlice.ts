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

import { UnconfirmedTransaction } from '@alephium/sdk/api/explorer'
import { createEntityAdapter, createSelector, createSlice, EntityState } from '@reduxjs/toolkit'

import { walletLocked, walletUnlocked } from '@/store/activeWalletSlice'

import { AddressHash } from '../types/addresses'
import { AddressUnconfirmedTransaction } from '../types/transactions'
import { selectAddressTransactions } from '../utils/addresses'
import { selectAllAddresses, syncAddressesData } from './addressesSlice'
import { RootState } from './store'

const sliceName = 'unconfirmedTransactions'

type UnconfirmedTransactionsState = EntityState<UnconfirmedTransaction>

const unconfirmedTransactionsAdapter = createEntityAdapter<UnconfirmedTransaction>({
  selectId: (transaction) => transaction.hash,
  sortComparer: (a, b) => b.lastSeen - a.lastSeen
})

const initialState: UnconfirmedTransactionsState = unconfirmedTransactionsAdapter.getInitialState()

const unconfirmedTransactionsSlice = createSlice({
  name: sliceName,
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(syncAddressesData.fulfilled, (state, action) => {
        const addresses = action.payload
        const unconfirmedTransactions = addresses.flatMap((address) => address.unconfirmedTransactions)
        const confirmedTransactionHashes = addresses.flatMap((address) => address.transactions).map((tx) => tx.hash)

        unconfirmedTransactionsAdapter.upsertMany(state, unconfirmedTransactions)
        unconfirmedTransactionsAdapter.removeMany(state, confirmedTransactionHashes)
      })
      .addCase(walletLocked, () => initialState)
      .addCase(walletUnlocked, () => initialState)
  }
})

export const { selectAll: selectAllConfirmedTransactions } = unconfirmedTransactionsAdapter.getSelectors<RootState>(
  (state) => state[sliceName]
)

export const selectAddressesUnconfirmedTransactions = createSelector(
  [selectAllAddresses, selectAllConfirmedTransactions, (_, addressHashes: AddressHash[]) => addressHashes],
  (allAddresses, unconfirmedTransactions, addressHashes): AddressUnconfirmedTransaction[] =>
    selectAddressTransactions(allAddresses, unconfirmedTransactions, addressHashes) as AddressUnconfirmedTransaction[]
)

export default unconfirmedTransactionsSlice
