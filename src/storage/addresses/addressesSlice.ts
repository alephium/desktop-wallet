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

import { addressToGroup, TOTAL_NUMBER_OF_GROUPS } from '@alephium/web3'
import { createSlice, isAnyOf, PayloadAction } from '@reduxjs/toolkit'
import { uniq } from 'lodash'

import {
  addressesRestoredFromMetadata,
  addressRestorationStarted,
  addressSettingsSaved,
  defaultAddressChanged,
  newAddressesSaved,
  syncAddressesBalances,
  syncAddressesData,
  syncAddressesHistoricBalances,
  syncAddressesTokens,
  syncAddressesTransactions,
  syncAddressTransactionsNextPage,
  syncAllAddressesTransactionsNextPage,
  syncingAddressDataStarted
} from '@/storage/addresses/addressesActions'
import { addressesAdapter, balanceHistoryAdapter } from '@/storage/addresses/addressesAdapters'
import { receiveTestnetTokens } from '@/storage/global/globalActions'
import { customNetworkSettingsSaved, networkPresetSwitched } from '@/storage/settings/networkActions'
import { transactionSent } from '@/storage/transactions/transactionsActions'
import { extractNewTransactionHashes, getTransactionsOfAddress } from '@/storage/transactions/transactionsUtils'
import {
  activeWalletDeleted,
  walletLocked,
  walletSaved,
  walletSwitched,
  walletUnlocked
} from '@/storage/wallets/walletActions'
import { Address, AddressBase, AddressesState, AddressHash } from '@/types/addresses'
import { UnlockedWallet } from '@/types/wallet'
import { getInitialAddressSettings } from '@/utils/addresses'

const initialState: AddressesState = addressesAdapter.getInitialState({
  loadingBalances: false,
  loadingTransactions: false,
  loadingTokens: false,
  syncingAddressData: false,
  isRestoringAddressesFromMetadata: false,
  status: 'uninitialized'
})

const addressesSlice = createSlice({
  name: 'addresses',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(syncingAddressDataStarted, (state) => {
        state.syncingAddressData = true
        state.loadingBalances = true
        state.loadingTransactions = true
        state.loadingTokens = true
      })
      .addCase(addressSettingsSaved, (state, action) => {
        const { addressHash, settings } = action.payload

        if (settings.isDefault) updateOldDefaultAddress(state)

        addressesAdapter.updateOne(state, {
          id: addressHash,
          changes: settings
        })
      })
      .addCase(defaultAddressChanged, (state, action) => {
        const address = action.payload

        updateOldDefaultAddress(state)

        addressesAdapter.updateOne(state, {
          id: address.hash,
          changes: {
            isDefault: true
          }
        })
      })
      .addCase(newAddressesSaved, (state, action) => {
        const addresses = action.payload

        if (addresses.some((address) => address.isDefault)) updateOldDefaultAddress(state)

        addressesAdapter.addMany(state, addresses.map(getDefaultAddressState))
      })
      .addCase(addressesRestoredFromMetadata, (state, action) => {
        const addresses = action.payload

        addressesAdapter.setAll(state, [])
        addressesAdapter.addMany(state, addresses.map(getDefaultAddressState))
        state.isRestoringAddressesFromMetadata = false
        state.status = 'uninitialized'
      })
      .addCase(addressRestorationStarted, (state) => {
        state.isRestoringAddressesFromMetadata = true
      })
      .addCase(syncAddressesData.fulfilled, (state, action) => {
        state.status = 'initialized'
        state.syncingAddressData = false
        state.loadingBalances = false
        state.loadingTransactions = false
        state.loadingTokens = false
      })
      .addCase(syncAddressesTokens.fulfilled, (state, action) => {
        const addressData = action.payload
        const updatedAddresses = addressData.map(({ hash, tokenBalances }) => ({
          id: hash,
          changes: {
            tokens: tokenBalances
          }
        }))

        addressesAdapter.updateMany(state, updatedAddresses)

        state.loadingTokens = false
      })
      .addCase(syncAddressesTransactions.fulfilled, (state, action) => {
        const addressData = action.payload
        const updatedAddresses = addressData.map(({ hash, transactions, mempoolTransactions }) => {
          const address = state.entities[hash] as Address
          const lastUsed =
            mempoolTransactions.length > 0
              ? mempoolTransactions[0].lastSeen
              : transactions.length > 0
              ? transactions[0].timestamp
              : address.lastUsed

          return {
            id: hash,
            changes: {
              transactions: uniq(address.transactions.concat(transactions.map((tx) => tx.hash))),
              transactionsPageLoaded: address.transactionsPageLoaded === 0 ? 1 : address.transactionsPageLoaded,
              lastUsed
            }
          }
        })

        addressesAdapter.updateMany(state, updatedAddresses)

        state.loadingTransactions = false
      })
      .addCase(syncAddressesBalances.fulfilled, (state, action) => {
        const addressData = action.payload
        const updatedAddresses = addressData.map(({ hash, balance, lockedBalance }) => ({
          id: hash,
          changes: {
            balance,
            lockedBalance
          }
        }))

        addressesAdapter.updateMany(state, updatedAddresses)

        state.loadingBalances = false
      })
      .addCase(syncAddressesData.rejected, (state) => {
        state.syncingAddressData = false
        state.loadingBalances = false
        state.loadingTransactions = false
        state.loadingTokens = false
      })
      .addCase(syncAddressesBalances.rejected, (state) => {
        state.loadingBalances = false
      })
      .addCase(syncAddressesTransactions.rejected, (state) => {
        state.loadingTransactions = false
      })
      .addCase(syncAddressesTokens.rejected, (state) => {
        state.loadingTokens = false
      })
      .addCase(syncAddressTransactionsNextPage.fulfilled, (state, action) => {
        const addressTransactionsData = action.payload

        if (!addressTransactionsData) return

        const { hash, transactions, page } = addressTransactionsData
        const address = state.entities[hash] as Address
        const newTxHashes = extractNewTransactionHashes(transactions, address.transactions)

        addressesAdapter.updateOne(state, {
          id: hash,
          changes: {
            transactions: address.transactions.concat(newTxHashes),
            transactionsPageLoaded: newTxHashes.length > 0 ? page : address.transactionsPageLoaded,
            allTransactionPagesLoaded: transactions.length === 0
          }
        })

        state.loadingTransactions = false
      })
      .addCase(syncAllAddressesTransactionsNextPage.fulfilled, (state, { payload: { transactions } }) => {
        const addresses = getAddresses(state)

        const updatedAddresses = addresses.map((address) => {
          const transactionsOfAddress = getTransactionsOfAddress(transactions, address)
          const newTxHashes = extractNewTransactionHashes(transactionsOfAddress, address.transactions)

          return {
            id: address.hash,
            changes: {
              transactions: address.transactions.concat(newTxHashes)
            }
          }
        })

        addressesAdapter.updateMany(state, updatedAddresses)

        state.loadingTransactions = false
      })
      .addCase(walletSaved, (state, action) => addInitialAddress(state, action.payload.initialAddress))
      .addCase(walletUnlocked, addPassphraseInitialAddress)
      .addCase(walletSwitched, (_, action) => addPassphraseInitialAddress({ ...initialState }, action))
      .addCase(walletLocked, () => initialState)
      .addCase(activeWalletDeleted, () => initialState)
      .addCase(networkPresetSwitched, clearAddressesNetworkData)
      .addCase(customNetworkSettingsSaved, clearAddressesNetworkData)
      .addCase(syncAddressesHistoricBalances.fulfilled, (state, { payload: data }) => {
        data.forEach(({ address, balances }) => {
          const addressState = state.entities[address]

          if (addressState) {
            balanceHistoryAdapter.upsertMany(addressState.balanceHistory, balances)
            addressState.balanceHistoryInitialized = true
          }
        })
      })

    builder.addMatcher(isAnyOf(transactionSent, receiveTestnetTokens.fulfilled), (state, action) => {
      const pendingTransaction = action.payload
      const fromAddress = state.entities[pendingTransaction.fromAddress] as Address
      const toAddress = state.entities[pendingTransaction.toAddress] as Address

      if (fromAddress) fromAddress.transactions.push(pendingTransaction.hash)
      if (toAddress && toAddress !== fromAddress) toAddress.transactions.push(pendingTransaction.hash)
    })
  }
})

export default addressesSlice

// Reducers helper functions

const getAddresses = (state: AddressesState, addressHashes?: AddressHash[]) => {
  const allAddresses = Object.values(state.entities) as Address[]
  return addressHashes ? allAddresses.filter((address) => addressHashes.includes(address.hash)) : allAddresses
}

const getDefaultAddressState = (address: AddressBase): Address => ({
  ...address,
  group: addressToGroup(address.hash, TOTAL_NUMBER_OF_GROUPS),
  balance: '0',
  lockedBalance: '0',
  txNumber: 0,
  transactions: [],
  transactionsPageLoaded: 0,
  allTransactionPagesLoaded: false,
  tokens: [],
  lastUsed: 0,
  balanceHistory: balanceHistoryAdapter.getInitialState(),
  balanceHistoryInitialized: false
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

const clearAddressesNetworkData = (state: AddressesState) => {
  addressesAdapter.updateMany(
    state,
    getAddresses(state).map((address) => ({ id: address.hash, changes: getDefaultAddressState(address) }))
  )

  state.status = 'uninitialized'
}

const addInitialAddress = (state: AddressesState, address: AddressBase) => {
  addressesAdapter.removeAll(state)
  state.status = 'uninitialized'
  return addressesAdapter.addOne(state, getDefaultAddressState(address))
}

const addPassphraseInitialAddress = (state: AddressesState, action: PayloadAction<UnlockedWallet>) => {
  const { wallet, initialAddress } = action.payload

  if (wallet.passphrase)
    return addInitialAddress(state, {
      ...initialAddress,
      ...getInitialAddressSettings()
    })
}
