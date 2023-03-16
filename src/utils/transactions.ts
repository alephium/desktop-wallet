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

import {
  calcTxAmountsDeltaForAddress,
  DUST_AMOUNT,
  getDirection,
  isConsolidationTx,
  MIN_UTXO_SET_AMOUNT
} from '@alephium/sdk'
import { MempoolTransaction, Output, Transaction } from '@alephium/sdk/api/explorer'
import { ALPH } from '@alephium/token-list'
import dayjs from 'dayjs'

import { MultiSelectOption } from '@/components/Inputs/MultiSelect'
import { SelectOption } from '@/components/Inputs/Select'
import i18n from '@/i18n'
import { Address, AddressHash } from '@/types/addresses'
import { AssetAmount } from '@/types/assets'
import {
  AddressPendingTransaction,
  AddressTransaction,
  Direction,
  PendingTransaction,
  TransactionTimePeriod
} from '@/types/transactions'
import { getAvailableBalance } from '@/utils/addresses'

export const isAmountWithinRange = (amount: bigint, maxAmount: bigint): boolean =>
  amount >= MIN_UTXO_SET_AMOUNT && amount <= maxAmount

export const isPendingTx = (tx: AddressTransaction): tx is AddressPendingTransaction =>
  (tx as AddressPendingTransaction).status === 'pending'

export const hasOnlyOutputsWith = (outputs: Output[], addresses: Address[]): boolean =>
  outputs.every((o) => o?.address && addresses.map((a) => a.hash).indexOf(o.address) >= 0)

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

export const expectedAmount = (data: { fromAddress: Address; alphAmount?: string }, fees: bigint): bigint => {
  const amountInPhi = BigInt(data.alphAmount ?? 0)
  const amountIncludingFees = amountInPhi + fees
  const exceededBy = amountIncludingFees - getAvailableBalance(data.fromAddress)
  const expectedAmount = exceededBy > 0 ? getAvailableBalance(data.fromAddress) - exceededBy : amountInPhi

  return expectedAmount
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

export const getTransactionAssetAmounts = (assetAmounts: AssetAmount[]) => {
  const alphAmount = assetAmounts.find((asset) => asset.id === ALPH.id)?.amount ?? BigInt(0)
  const tokens = assetAmounts
    .filter((asset): asset is Required<AssetAmount> => asset.id !== ALPH.id && asset.amount !== undefined)
    .map((asset) => ({ id: asset.id, amount: asset.amount.toString() }))

  const dustAmount = DUST_AMOUNT * BigInt(tokens.length)
  const attoAlphAmount = (alphAmount + dustAmount).toString()

  return {
    attoAlphAmount,
    tokens
  }
}

const now = dayjs()
const currentYear = now.year()
const today = now.format('DD/MM/YYYY')

export const timePeriodsOptions: SelectOption<TransactionTimePeriod>[] = [
  {
    value: '24h',
    label: i18n.t('Last 24h')
  },
  {
    value: '1w',
    label: i18n.t('Last week')
  },
  {
    value: '1m',
    label: i18n.t('Last month')
  },
  {
    value: '6m',
    label: i18n.t('Last 6 months')
  },
  {
    value: '12m',
    label: `${i18n.t('Last 12 months')}
    (${now.subtract(1, 'year').format('DD/MM/YYYY')}
    - ${today})`
  },
  {
    value: 'previousYear',
    label: `${i18n.t('Previous year')}
    (01/01/${currentYear - 1} - 31/12/${currentYear - 1})`
  },
  {
    value: 'thisYear',
    label: `${i18n.t('This year')} (01/01/${currentYear - 1} - ${today})`
  }
]

export const directionOptions: MultiSelectOption<Direction>[] = [
  {
    label: i18n.t('Sent'),
    value: 'out'
  },
  {
    label: i18n.t('Received'),
    value: 'in'
  },
  {
    label: i18n.t('Moved'),
    value: 'move'
  }
]

export const getTxDirection = (
  tx: AddressTransaction,
  internalAddresses: Address[],
  showInternalInflows?: boolean
): Direction => {
  if (isPendingTx(tx)) {
    return 'out'
  } else if (isConsolidationTx(tx)) {
    return 'move'
  } else {
    const direction = getDirection(tx, tx.address.hash)
    const isInternalTransfer = hasOnlyOutputsWith(tx.outputs ?? [], internalAddresses)

    return (isInternalTransfer && showInternalInflows && direction === 'out') ||
      (isInternalTransfer && !showInternalInflows)
      ? 'move'
      : direction
  }
}
