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

import { MIN_UTXO_SET_AMOUNT } from '@alephium/sdk'
import { Transaction } from '@alephium/sdk/api/explorer'

import { SimpleTx } from '../contexts/addresses'

type HasTimestamp = { timestamp: number }
type TransactionVariant = Transaction | SimpleTx

export const isAmountWithinRange = (amount: bigint, maxAmount: bigint): boolean => {
  return amount >= MIN_UTXO_SET_AMOUNT && amount <= maxAmount
}

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
export function isSimpleTx(tx: TransactionVariant): tx is SimpleTx {
  const _tx = tx as SimpleTx
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
