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

import { calAmountDelta, MIN_UTXO_SET_AMOUNT } from '@alephium/sdk'
import { Input, Output, Transaction } from '@alephium/sdk/api/explorer'

import { Address, AddressHash, PendingTx } from '../contexts/addresses'

type HasTimestamp = { timestamp: number }
type TransactionVariant = Transaction | PendingTx
type IsTransactionVariant<T extends Transaction | PendingTx> = T extends Transaction
  ? Transaction
  : T extends PendingTx
  ? PendingTx
  : never
export type BelongingToAddress<T extends Transaction | PendingTx> = { data: IsTransactionVariant<T>; address: Address }

export const isAmountWithinRange = (amount: bigint, maxAmount: bigint): boolean =>
  amount >= MIN_UTXO_SET_AMOUNT && amount <= maxAmount

export type TransactionDirection = 'out' | 'in'
export type TransactionInfoType = TransactionDirection | 'move' | 'pending'
export type TransactionType = 'consolidation' | 'transfer' | 'sweep'
export type TransactionStatus = 'pending' | 'confirmed'

export const getTransactionsForAddresses = (
  txStatus: TransactionStatus,
  addresses: Address[]
): BelongingToAddress<TransactionVariant>[] =>
  addresses
    .map((address) =>
      address.transactions[txStatus].map((tx) => ({
        data: tx,
        address
      }))
    )
    .flat()
    .sort((a, b) => sortTransactions(a.data, b.data))

export function isExplorerTransaction(tx: TransactionVariant): tx is Transaction {
  const _tx = tx as Transaction
  return (
    (_tx.hash !== undefined &&
      _tx.blockHash !== undefined &&
      _tx.timestamp !== undefined &&
      _tx.gasAmount !== undefined &&
      _tx.gasPrice !== undefined) === true
  )
}
export function isPendingTx(tx: TransactionVariant): tx is PendingTx {
  const _tx = tx as PendingTx
  return (
    (_tx.txId !== undefined &&
      _tx.fromAddress !== undefined &&
      _tx.toAddress !== undefined &&
      _tx.timestamp !== undefined &&
      _tx.type !== undefined &&
      _tx.network !== undefined) === true
  )
}

export function sortTransactions(a: HasTimestamp, b: HasTimestamp): number {
  const delta = b.timestamp - a.timestamp

  // Sent and received in the same block, but will not be in the right order when displaying
  if (delta === 0) {
    return -1
  }

  return delta
}

export const hasOnlyInputsWith = (inputs: Input[], addresses: Address[]): boolean =>
  inputs.every((i) => i?.address && addresses.map((a) => a.hash).indexOf(i.address) >= 0)

export const hasOnlyOutputsWith = (outputs: Output[], addresses: Address[]): boolean =>
  outputs.every((o) => o?.address && addresses.map((a) => a.hash).indexOf(o.address) >= 0)

export const getDirection = (tx: Transaction, address: AddressHash): TransactionDirection => {
  const amount = calAmountDelta(tx, address)
  const amountIsBigInt = typeof amount === 'bigint'
  return amount && amountIsBigInt && amount < 0 ? 'out' : 'in'
}
