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

import { addressToGroup, TOTAL_NUMBER_OF_GROUPS } from '@alephium/sdk'
import {
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
  createSlice,
  EntityState,
  PayloadAction
} from '@reduxjs/toolkit'
import { chunk, uniq } from 'lodash'

import {
  fetchAddressesData,
  fetchAddressesTransactionsNextPage,
  fetchAddressTransactionsNextPage
} from '@/api/addresses'
import { AddressBase, AddressHash, AddressRedux, AddressSettingsRedux, LoadingEnabled } from '@/types/addresses'
import { PendingTransaction } from '@/types/transactions'
import { extractNewTransactionHashes } from '@/utils/transactions'

import { walletLocked, walletSaved, walletSwitched } from './activeWalletSlice'
import { RootState } from './store'

const sliceName = 'addresses'

const addressesAdapter = createEntityAdapter<AddressRedux>({
  selectId: (address) => address.hash,
  sortComparer: (a, b) => {
    // Always keep main address to the top of the list
    if (a.isDefault) return -1
    if (b.isDefault) return 1
    return (b.lastUsed ?? 0) - (a.lastUsed ?? 0)
  }
})

interface AddressesState extends EntityState<AddressRedux> {
  loading: boolean
  transactionsPageLoaded: number
  allTransactionsLoaded: boolean
  isRestoringAddressesFromMetadata: boolean
  status: 'uninitialized' | 'initialized'
}

const initialState: AddressesState = addressesAdapter.getInitialState({
  loading: false,
  transactionsPageLoaded: 0,
  allTransactionsLoaded: false,
  isRestoringAddressesFromMetadata: false,
  status: 'uninitialized'
})

export const syncAddressesData = createAsyncThunk(
  `${sliceName}/syncAddressesData`,
  async (payload: AddressHash[] | undefined, { getState, dispatch }) => {
    dispatch(loadingStarted())

    const state = getState() as RootState
    const addresses = payload ?? (state.addresses.ids as AddressHash[])
    const results = await fetchAddressesData(addresses)

    return results
  }
)

export const syncAddressTransactionsNextPage = createAsyncThunk(
  `${sliceName}/syncAddressTransactionsNextPage`,
  async (payload: AddressHash, { getState, dispatch }) => {
    dispatch(loadingStarted())

    const state = getState() as RootState
    const address = selectAddressByHash(state, payload)

    if (!address) return

    return await fetchAddressTransactionsNextPage(address)
  }
)

export const syncAllAddressesTransactionsNextPage = createAsyncThunk(
  `${sliceName}/syncAllAddressesTransactionsNextPage`,
  async (_, { getState, dispatch }) => {
    dispatch(loadingStarted())

    const state = getState() as RootState
    const addresses = selectAllAddresses(state)
    const nextPage = state.addresses.transactionsPageLoaded + 1

    // NOTE: Explorer backend limits this query to 80 addresses
    const results = await Promise.all(
      chunk(addresses, 80).map((addressesChunk) => fetchAddressesTransactionsNextPage(addressesChunk, nextPage))
    )

    return { page: nextPage, transactions: results.flat() }
  }
)

const addressesSlice = createSlice({
  name: sliceName,
  initialState,
  reducers: {
    loadingStarted: (state) => {
      state.loading = true
    },
    addressRestorationStarted: (state) => {
      state.isRestoringAddressesFromMetadata = true
    },
    addressDiscoveryStarted: (state, action: PayloadAction<LoadingEnabled>) => {
      const loadingEnabled = action.payload

      if (loadingEnabled) state.loading = true
    },
    addressDiscoveryFinished: (state, action: PayloadAction<LoadingEnabled>) => {
      const loadingEnabled = action.payload

      if (loadingEnabled) state.loading = false
    },
    addressesRestoredFromMetadata: (state, action: PayloadAction<AddressBase[]>) => {
      const addresses = action.payload

      addressesAdapter.setAll(state, [])
      addressesAdapter.addMany(state, addresses.map(getDefaultAddressState))
      state.isRestoringAddressesFromMetadata = false
      state.status = 'uninitialized'
    },
    transactionSent: (state, action: PayloadAction<PendingTransaction>) => {
      const pendingTransaction = action.payload
      const address = state.entities[pendingTransaction.fromAddress] as AddressRedux

      address.transactions.push(pendingTransaction.hash)
    },
    newAddressesGenerated: (state, action: PayloadAction<AddressBase[]>) => {
      const addresses = action.payload

      if (addresses.some((address) => address.isDefault)) updateOldDefaultAddress(state)

      addressesAdapter.addMany(state, addresses.map(getDefaultAddressState))
    },
    defaultAddressChanged: (state, action: PayloadAction<AddressRedux>) => {
      const address = action.payload

      updateOldDefaultAddress(state)

      addressesAdapter.updateOne(state, {
        id: address.hash,
        changes: {
          isDefault: true
        }
      })
    },
    addressSettingsSaved: (
      state,
      action: PayloadAction<{ addressHash: AddressHash; settings: AddressSettingsRedux }>
    ) => {
      const { addressHash, settings } = action.payload

      if (settings.isDefault) updateOldDefaultAddress(state)

      addressesAdapter.updateOne(state, {
        id: addressHash,
        changes: settings
      })
    }
  },
  extraReducers(builder) {
    builder
      .addCase(walletSaved, (state, action) => {
        const { initialAddress } = action.payload

        addressesAdapter.setAll(state, [])
        addressesAdapter.addOne(state, getDefaultAddressState(initialAddress))
        state.status = 'uninitialized'
      })
      .addCase(syncAddressesData.fulfilled, (state, action) => {
        const addressData = action.payload
        const updatedAddresses = addressData.map(({ hash, details, tokens, transactions }) => {
          const address = state.entities[hash] as AddressRedux

          return {
            id: hash,
            changes: {
              ...details,
              tokens,
              transactions: uniq(address.transactions.concat(transactions.map((tx) => tx.hash))),
              transactionsPageLoaded: address.transactionsPageLoaded === 0 ? 1 : address.transactionsPageLoaded,
              lastUsed: transactions.length > 0 ? transactions[0].timestamp : address.lastUsed
            }
          }
        })

        addressesAdapter.updateMany(state, updatedAddresses)

        state.status = 'initialized'
        state.loading = false
      })
      .addCase(syncAddressTransactionsNextPage.fulfilled, (state, action) => {
        const addressTransactionsData = action.payload

        if (!addressTransactionsData) return

        const { hash, transactions, page } = addressTransactionsData
        const address = state.entities[hash] as AddressRedux
        const newTxHashes = extractNewTransactionHashes(transactions, address.transactions)

        addressesAdapter.updateOne(state, {
          id: hash,
          changes: {
            transactions: address.transactions.concat(newTxHashes),
            transactionsPageLoaded: newTxHashes.length > 0 ? page : address.transactionsPageLoaded,
            allTransactionPagesLoaded: transactions.length === 0
          }
        })

        state.loading = false
      })
      .addCase(syncAllAddressesTransactionsNextPage.fulfilled, (state, action) => {
        const { page, transactions } = action.payload

        const addresses = getAddresses(state)

        const updatedAddresses = addresses.map((address) => {
          const transactionsOfAddress = transactions.filter(
            (tx) =>
              tx.inputs?.some((input) => input.address === address.hash) ||
              tx.outputs?.some((output) => output.address === address.hash)
          )

          const newTxHashes = extractNewTransactionHashes(transactionsOfAddress, address.transactions)

          return {
            id: address.hash,
            changes: {
              transactions: address.transactions.concat(newTxHashes)
            }
          }
        })

        addressesAdapter.updateMany(state, updatedAddresses)

        state.transactionsPageLoaded = transactions.length > 0 ? page : state.transactionsPageLoaded
        state.allTransactionsLoaded = transactions.length === 0
        state.loading = false
      })
      .addCase(walletLocked, () => initialState)
      .addCase(walletSwitched, () => initialState)
    // TODO
    // .addCase(networkPresetSwitched, clearAddressesNetworkData)
    // .addCase(customNetworkSettingsSaved, clearAddressesNetworkData)
  }
})

export const {
  loadingStarted,
  addressesRestoredFromMetadata,
  addressRestorationStarted,
  transactionSent,
  newAddressesGenerated,
  defaultAddressChanged,
  addressSettingsSaved,
  addressDiscoveryStarted,
  addressDiscoveryFinished
} = addressesSlice.actions

export const {
  selectById: selectAddressByHash,
  selectAll: selectAllAddresses,
  selectIds: selectAddressIds
} = addressesAdapter.getSelectors<RootState>((state) => state[sliceName])

export const selectHaveAllPagesLoaded = createSelector(
  [selectAllAddresses, (state: AddressesState) => state.allTransactionsLoaded],
  (addresses, allTransactionsLoaded) =>
    addresses.every((address) => address.allTransactionPagesLoaded) || allTransactionsLoaded
)

export const selectDefaultAddress = createSelector(selectAllAddresses, (addresses) =>
  addresses.find((address) => address.isDefault)
)

export const selectTotalBalance = createSelector([selectAllAddresses], (addresses) =>
  addresses.reduce((acc, address) => acc + BigInt(address.balance), BigInt(0))
)

const getAddresses = (state: AddressesState) => Object.values(state.entities) as AddressRedux[]

export default addressesSlice

const getDefaultAddressState = (address: AddressBase) => ({
  ...address,
  group: addressToGroup(address.hash, TOTAL_NUMBER_OF_GROUPS),
  balance: '0',
  lockedBalance: '0',
  txNumber: 0,
  transactions: [],
  transactionsPageLoaded: 0,
  allTransactionPagesLoaded: false,
  tokens: [],
  lastUsed: 0
})

const updateOldDefaultAddress = (state: AddressesState) => {
  const oldDefaultAddress = getAddresses(state).find((address) => address.isDefault)

  if (oldDefaultAddress) {
    addressesAdapter.updateOne(state, {
      id: oldDefaultAddress.hash,
      changes: {
        isDefault: false
      }
    })
  }
}

// const clearAddressesNetworkData = (state: AddressesState) => {
//   const reinitializedAddresses = getAddresses(state).map(getDefaultAddressState)

//   addressesAdapter.updateMany(
//     state,
//     reinitializedAddresses.map((address) => ({ id: address.hash, changes: address }))
//   )

//   state.status = 'uninitialized'
// }
