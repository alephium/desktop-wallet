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

import { makeSelectAddresses } from '@/storage/addresses/addressesSelectors'
import { RootState } from '@/storage/store'
import { confirmedTransactionsAdapter, pendingTransactionsAdapter } from '@/storage/transactions/transactionsAdapters'
import { AddressConfirmedTransaction, AddressPendingTransaction } from '@/types/transactions'
import { selectAddressTransactions } from '@/utils/addresses'

export const { selectAll: selectAllConfirmedTransactions } = confirmedTransactionsAdapter.getSelectors<RootState>(
  (state) => state.confirmedTransactions
)

export const makeSelectAddressesConfirmedTransactions = () =>
  createSelector(
    [selectAllConfirmedTransactions, makeSelectAddresses()],
    (confirmedTransactions, addresses): AddressConfirmedTransaction[] =>
      selectAddressTransactions(addresses, confirmedTransactions) as AddressConfirmedTransaction[]
  )

export const { selectAll: selectAllPendingTransactions } = pendingTransactionsAdapter.getSelectors<RootState>(
  (state) => state.pendingTransactions
)

export const makeSelectAddressesPendingTransactions = () =>
  createSelector(
    [selectAllPendingTransactions, makeSelectAddresses()],
    (pendingTransactions, addresses): AddressPendingTransaction[] =>
      selectAddressTransactions(addresses, pendingTransactions) as AddressPendingTransaction[]
  )

export const makeSelectAddressesHashesWithPendingTransactions = () =>
  createSelector([selectAllPendingTransactions, makeSelectAddresses()], (allPendingTransactions, addresses) =>
    addresses
      .filter(({ hash }) =>
        allPendingTransactions.some(({ fromAddress, toAddress }) => fromAddress === hash || toAddress === hash)
      )
      .map(({ hash }) => hash)
  )
