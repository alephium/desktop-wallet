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

import { createSelector } from '@reduxjs/toolkit'

import { selectAllAddresses } from '@/storage/addresses/addressesSelectors'
import { RootState } from '@/storage/store'
import { confirmedTransactionsAdapter, pendingTransactionsAdapter } from '@/storage/transactions/transactionsAdapters'
import { AddressHash } from '@/types/addresses'
import { AddressConfirmedTransaction, AddressPendingTransaction } from '@/types/transactions'
import { selectAddressTransactions } from '@/utils/addresses'

export const { selectAll: selectAllConfirmedTransactions } = confirmedTransactionsAdapter.getSelectors<RootState>(
  (state) => state.confirmedTransactions
)

export const selectAddressesConfirmedTransactions = createSelector(
  [selectAllAddresses, selectAllConfirmedTransactions, (_, addressHashes: AddressHash[]) => addressHashes],
  (allAddresses, confirmedTransactions, addressHashes): AddressConfirmedTransaction[] =>
    selectAddressTransactions(allAddresses, confirmedTransactions, addressHashes) as AddressConfirmedTransaction[]
)

export const { selectAll: selectAllPendingTransactions } = pendingTransactionsAdapter.getSelectors<RootState>(
  (state) => state.pendingTransactions
)

export const selectAddressesPendingTransactions = createSelector(
  [selectAllAddresses, selectAllPendingTransactions, (_, addressHashes: AddressHash[]) => addressHashes],
  (allAddresses, pendingTransactions, addressHashes): AddressPendingTransaction[] =>
    selectAddressTransactions(allAddresses, pendingTransactions, addressHashes) as AddressPendingTransaction[]
)

export const selectAddressesHashesWithPendingTransactions = createSelector(
  [selectAllAddresses, selectAllPendingTransactions, (_, addressHashes?: AddressHash[]) => addressHashes],
  (allAddresses, allPendingTransactions, addressHashes) => {
    const addresses = addressHashes
      ? allAddresses.filter((address) => addressHashes.includes(address.hash))
      : allAddresses

    return addresses
      .filter(({ hash }) =>
        allPendingTransactions.some(({ fromAddress, toAddress }) => fromAddress === hash || toAddress === hash)
      )
      .map(({ hash }) => hash)
  }
)
