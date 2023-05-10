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

import { AddressKeyPair } from '@alephium/sdk'
import { explorer } from '@alephium/web3'
import { EntityState } from '@reduxjs/toolkit'

import { TokenBalances } from '@/types/assets'
import { TimeInMs } from '@/types/numbers'
import { PendingTransaction } from '@/types/transactions'

export type DeprecatedAddressSettings = {
  isMain: boolean
  label?: string
  color?: string
}

export type DeprecatedAddressMetadata = DeprecatedAddressSettings & {
  index: number
}

export type AddressSettings = {
  isDefault: boolean
  color: string
  label?: string
}

export type AddressMetadata = AddressSettings & {
  index: number
}

export type AddressBase = AddressKeyPair & AddressSettings

export type BalanceHistory = {
  date: string // CHART_DATE_FORMAT
  balance: string
}

export type Address = AddressBase &
  explorer.AddressInfo & {
    group: number
    transactions: (explorer.Transaction['hash'] | PendingTransaction['hash'])[]
    transactionsPageLoaded: number
    allTransactionPagesLoaded: boolean
    tokens: TokenBalances[]
    lastUsed: TimeInMs
    balanceHistory: EntityState<BalanceHistory>
    balanceHistoryInitialized: boolean
  }

export type AddressHash = string

export type LoadingEnabled = boolean | undefined

export type AddressDataSyncResult = {
  hash: AddressHash
  details: explorer.AddressInfo
  transactions: explorer.Transaction[]
  mempoolTransactions: explorer.MempoolTransaction[]
  tokens: TokenBalances[]
}

export interface AddressesState extends EntityState<Address> {
  loading: boolean
  isRestoringAddressesFromMetadata: boolean
  status: 'uninitialized' | 'initialized'
}
