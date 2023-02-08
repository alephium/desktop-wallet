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

import { AddressKeyPair } from '@alephium/sdk'
import { AddressBalance, AddressInfo, Token, Transaction } from '@alephium/sdk/api/explorer'

import { TimeInMs } from './numbers'
import { PendingTransaction } from './transactions'

export type AddressSettings = {
  isMain: boolean
  label?: string
  color?: string
}

export type AddressMetadata = AddressSettings & {
  index: number
}

export type AddressSettingsRedux = {
  isDefault: boolean
  color: string
  label?: string
}

export type AddressMetadataRedux = AddressSettingsRedux & {
  index: number
}

export type AddressBase = AddressKeyPair & AddressSettingsRedux

export type AddressRedux = AddressBase &
  AddressInfo & {
    group: number
    transactions: (Transaction['hash'] | PendingTransaction['hash'])[]
    transactionsPageLoaded: number
    allTransactionPagesLoaded: boolean
    tokens: {
      id: Token['id']
      balances: AddressBalance
    }[]
    lastUsed: TimeInMs
  }

export type AddressHash = string

export type LoadingEnabled = boolean | undefined
