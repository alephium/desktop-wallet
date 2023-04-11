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
  MIN_UTXO_SET_AMOUNT,
  TransactionDirection,
  TransactionInfoType
} from '@alephium/sdk'
import { AssetOutput, Output } from '@alephium/sdk/api/explorer'
import { ALPH } from '@alephium/token-list'
import dayjs from 'dayjs'

import { SelectOption } from '@/components/Inputs/Select'
import i18n from '@/i18n'
import { store } from '@/storage/store'
import { Address } from '@/types/addresses'
import { AssetAmount } from '@/types/assets'
import { TranslationKey } from '@/types/i18next'
import {
  AddressPendingTransaction,
  AddressTransaction,
  Direction,
  TransactionInfo,
  TransactionTimePeriod
} from '@/types/transactions'

export const isAmountWithinRange = (amount: bigint, maxAmount: bigint): boolean =>
  amount >= MIN_UTXO_SET_AMOUNT && amount <= maxAmount

export const isPendingTx = (tx: AddressTransaction): tx is AddressPendingTransaction =>
  (tx as AddressPendingTransaction).status === 'pending'

export const hasOnlyOutputsWith = (outputs: Output[], addresses: Address[]): boolean =>
  outputs.every((o) => o?.address && addresses.map((a) => a.hash).indexOf(o.address) >= 0)

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

export const getOptionalTransactionAssetAmounts = (assetAmounts?: AssetAmount[]) =>
  assetAmounts ? getTransactionAssetAmounts(assetAmounts) : { attoAlphAmount: undefined, tokens: undefined }

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

export const directionOptions: {
  value: Direction
  label: TranslationKey
}[] = [
  {
    label: 'Sent',
    value: 'out'
  },
  {
    label: 'Received',
    value: 'in'
  },
  {
    label: 'Moved',
    value: 'move'
  }
]

export const getTransactionInfo = (tx: AddressTransaction, showInternalInflows?: boolean): TransactionInfo => {
  const state = store.getState()
  const assetsInfo = state.assetsInfo.entities
  const addresses = Object.values(state.addresses.entities) as Address[]

  let amount: bigint | undefined = BigInt(0)
  let direction: TransactionDirection
  let infoType: TransactionInfoType
  let outputs: Output[] = []
  let lockTime: Date | undefined
  let tokens: Required<AssetAmount>[] = []

  if (isPendingTx(tx)) {
    direction = 'out'
    infoType = 'pending'
    amount = tx.amount ? BigInt(tx.amount) : undefined
    tokens = tx.tokens ? tx.tokens.map((token) => ({ ...token, amount: BigInt(token.amount) })) : []
    lockTime = tx.lockTime !== undefined ? new Date(tx.lockTime) : undefined
  } else {
    outputs = tx.outputs ?? outputs
    const { alph: alphAmount, tokens: tokenAmounts } = calcTxAmountsDeltaForAddress(tx, tx.address.hash)

    amount = alphAmount
    tokens = tokenAmounts.map((token) => ({ ...token, amount: token.amount }))

    if (isConsolidationTx(tx)) {
      direction = 'out'
      infoType = 'move'
    } else {
      direction = getDirection(tx, tx.address.hash)
      const isInternalTransfer = hasOnlyOutputsWith(outputs, addresses)
      infoType =
        (isInternalTransfer && showInternalInflows && direction === 'out') ||
        (isInternalTransfer && !showInternalInflows)
          ? 'move'
          : direction
    }

    lockTime = outputs.reduce(
      (a, b) => (a > new Date((b as AssetOutput).lockTime ?? 0) ? a : new Date((b as AssetOutput).lockTime ?? 0)),
      new Date(0)
    )
    lockTime = lockTime.toISOString() === new Date(0).toISOString() ? undefined : lockTime
  }

  const tokenAssets = [...tokens.map((token) => ({ ...token, ...assetsInfo[token.id] }))]
  const assets = amount !== undefined ? [{ ...ALPH, amount }, ...tokenAssets] : tokenAssets

  return {
    assets,
    direction,
    infoType,
    outputs,
    lockTime
  }
}
