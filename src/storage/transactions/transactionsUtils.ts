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

import { calcTxAmountsDeltaForAddress } from '@alephium/sdk'
import { MempoolTransaction, Transaction } from '@alephium/sdk/api/explorer'

import { Address, AddressHash } from '@/types/addresses'
import { PendingTransaction } from '@/types/transactions'

// It can currently only take care of sending transactions.
// See: https://github.com/alephium/explorer-backend/issues/360
export const convertUnconfirmedTxToPendingTx = (
  tx: MempoolTransaction,
  fromAddress: AddressHash
): PendingTransaction => {
  if (!tx.outputs) throw 'Missing transaction details'

  const toAddress = tx.outputs[0].address
  const { alph: alphAmount, tokens } = calcTxAmountsDeltaForAddress(tx, toAddress)

  if (!fromAddress) throw new Error('fromAddress is not defined')
  if (!toAddress) throw new Error('toAddress is not defined')

  return {
    hash: tx.hash,
    fromAddress,
    toAddress,
    // No other reasonable way to know when it was sent, so using the lastSeen is the best approximation
    timestamp: tx.lastSeen,
    type: 'transfer',
    amount: alphAmount.toString(),
    tokens: tokens.map((token) => ({ ...token, amount: token.amount.toString() })),
    status: 'pending'
  }
}

export const extractNewTransactionHashes = (
  incomingTransactions: Transaction[],
  existingTransactions: Transaction['hash'][]
): Transaction['hash'][] =>
  incomingTransactions
    .filter((newTx) => !existingTransactions.some((existingTx) => existingTx === newTx.hash))
    .map((tx) => tx.hash)

export const getTransactionsOfAddress = (transactions: Transaction[], address: Address) =>
  transactions.filter(
    (tx) =>
      tx.inputs?.some((input) => input.address === address.hash) ||
      tx.outputs?.some((output) => output.address === address.hash)
  )
