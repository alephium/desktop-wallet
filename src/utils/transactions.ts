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

import { calcTxAmountsDeltaForAddress, fromHumanReadableAmount, MIN_UTXO_SET_AMOUNT } from '@alephium/sdk'
import { Input, MempoolTransaction, Output, Transaction } from '@alephium/sdk/api/explorer'

import { Address, AddressHash } from '../contexts/addresses'
import { PendingTx, TransactionStatus } from '../types/transactions'
import { NetworkName } from './settings'

export type TransactionVariant = Transaction | PendingTx
type IsTransactionVariant<T extends TransactionVariant> = T extends Transaction
  ? Transaction
  : T extends PendingTx
  ? PendingTx
  : never
export type BelongingToAddress<T extends TransactionVariant> = { data: IsTransactionVariant<T>; address: Address }

export const isAmountWithinRange = (amount: bigint, maxAmount: bigint): boolean =>
  amount >= MIN_UTXO_SET_AMOUNT && amount <= maxAmount

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

export const isPendingTx = (tx: TransactionVariant): tx is PendingTx => (tx as PendingTx).status === 'pending'

type HasTimestamp = { timestamp: number }

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

// It can currently only take care of sending transactions.
// See: https://github.com/alephium/explorer-backend/issues/360
export const convertUnconfirmedTxToPendingTx = (
  tx: MempoolTransaction,
  fromAddress: AddressHash,
  network: NetworkName
): PendingTx => {
  if (!tx.outputs) throw 'Missing transaction details'

  const toAddress = tx.outputs[0].address
  const { alph: amount } = calcTxAmountsDeltaForAddress(tx, toAddress)

  if (!fromAddress) throw new Error('fromAddress is not defined')
  if (!toAddress) throw new Error('toAddress is not defined')

  return {
    txId: tx.hash,
    fromAddress,
    toAddress,
    // No other reasonable way to know when it was sent, so using the lastSeen is the best approximation
    timestamp: tx.lastSeen,
    type: 'transfer',
    // SUPER important that this is the same as the current network. Lots of debug time used tracking this down.
    network,
    amount,
    status: 'pending'
  }
}

export const expectedAmount = (data: { fromAddress: Address; alphAmount?: string }, fees: bigint): bigint => {
  const amountInSet = data.alphAmount ? fromHumanReadableAmount(data.alphAmount) : BigInt(0)
  const amountIncludingFees = amountInSet + fees
  const exceededBy = amountIncludingFees - data.fromAddress.availableBalance
  const expectedAmount = exceededBy > 0 ? data.fromAddress.availableBalance - exceededBy : amountInSet

  return expectedAmount
}
