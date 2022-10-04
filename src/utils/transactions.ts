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
import { AssetOutput } from '@alephium/sdk/api/alephium'
import { Input, Output, Transaction, UnconfirmedTransaction } from '@alephium/sdk/api/explorer'
import { uniq } from 'lodash'

import { Address, AddressHash, PendingTx } from '../contexts/addresses'
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

export const getDirection = (tx: Transaction, address: AddressHash): TransactionDirection =>
  calAmountDelta(tx, address) < 0 ? 'out' : 'in'

export const calculateUnconfirmedTxSentAmount = (tx: UnconfirmedTransaction, address: AddressHash): bigint => {
  if (!tx.inputs || !tx.outputs) throw 'Missing transaction details'

  const totalOutputAmount = tx.outputs.reduce((acc, output) => acc + BigInt(output.attoAlphAmount), BigInt(0))

  if (isConsolidationTx(tx)) return removeConsolidationChangeAmount(totalOutputAmount, tx.outputs)

  const totalOutputAmountOfAddress = tx.outputs.reduce(
    (acc, output) => (output.address === address ? acc + BigInt(output.attoAlphAmount) : acc),
    BigInt(0)
  )

  return totalOutputAmount - totalOutputAmountOfAddress
}

export const isConsolidationTx = (tx: Transaction | UnconfirmedTransaction): boolean => {
  const inputAddresses = tx.inputs ? uniq(tx.inputs.map((input) => input.address)) : []
  const outputAddresses = tx.outputs ? uniq(tx.outputs.map((output) => output.address)) : []

  return inputAddresses.length === 1 && outputAddresses.length === 1 && inputAddresses[0] === outputAddresses[0]
}

export const removeConsolidationChangeAmount = (totalOutputAmount: bigint, outputs: AssetOutput[] | Output[]) =>
  outputs.length > 1
    ? // If there are multiple outputs, the last one must be the change amount (this is a heuristic and not guaranteed)
      totalOutputAmount - BigInt(outputs[outputs.length - 1].attoAlphAmount)
    : // otherwise, it's a sweep transaction that consolidates all funds
      totalOutputAmount

// It can currently only take care of sending transactions.
// See: https://github.com/alephium/explorer-backend/issues/360
export const convertUnconfirmedTxToPendingTx = (
  tx: UnconfirmedTransaction,
  fromAddress: AddressHash,
  network: NetworkName
): PendingTx => {
  if (!tx.outputs) throw 'Missing transaction details'

  const amount = calculateUnconfirmedTxSentAmount(tx, fromAddress)
  const toAddress = tx.outputs[0].address

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
