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
  getDirection,
  isConsolidationTx,
  TransactionDirection,
  TransactionInfoType
} from '@alephium/sdk'
import { AssetOutput, Output } from '@alephium/sdk/api/explorer'
import { ALPH } from '@alephium/token-list'

import { useAppSelector } from '@/hooks/redux'
import { selectAllAddresses } from '@/storage/addresses/addressesSelectors'
import { AddressHash } from '@/types/addresses'
import { AssetAmount, TransactionInfoAsset } from '@/types/assets'
import { AddressTransaction } from '@/types/transactions'
import { convertToPositive } from '@/utils/misc'
import { hasOnlyOutputsWith, isPendingTx } from '@/utils/transactions'

interface TransactionInfo {
  assets: TransactionInfoAsset[]
  direction: TransactionDirection
  infoType: TransactionInfoType
  outputs: Output[]
  lockTime?: Date
}

export const useTransactionInfo = (
  tx: AddressTransaction,
  addressHash: AddressHash,
  showInternalInflows?: boolean
): TransactionInfo => {
  const addresses = useAppSelector(selectAllAddresses)
  const assetsInfo = useAppSelector((state) => state.assetsInfo.entities)

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
    const { alph: alphAmount, tokens: tokenAmounts } = calcTxAmountsDeltaForAddress(tx, addressHash)

    amount = convertToPositive(alphAmount)
    tokens = tokenAmounts.map((token) => ({ ...token, amount: convertToPositive(token.amount) }))

    if (isConsolidationTx(tx)) {
      direction = 'out'
      infoType = 'move'
    } else {
      direction = getDirection(tx, addressHash)
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
