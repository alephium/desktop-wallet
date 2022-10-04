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

import { calAmountDelta } from '@alephium/sdk'
import { AssetOutput, Output } from '@alephium/sdk/api/explorer'

import { AddressHash, useAddressesContext } from '../contexts/addresses'
import {
  hasOnlyOutputsWith,
  isConsolidationTx,
  isPendingTx,
  removeConsolidationChangeAmount,
  TransactionDirection,
  TransactionInfoType,
  TransactionVariant
} from '../utils/transactions'

export const useTransactionInfo = (tx: TransactionVariant, addressHash: AddressHash) => {
  const { addresses } = useAddressesContext()

  let amount: bigint | undefined = BigInt(0)
  let direction: TransactionDirection
  let infoType: TransactionInfoType
  let outputs: Output[] = []
  let lockTime: Date | undefined

  if (isPendingTx(tx)) {
    direction = 'out'
    infoType = 'pending'
    amount = tx.amount
    lockTime = tx.lockTime
  } else {
    outputs = tx.outputs ?? outputs

    if (isConsolidationTx(tx) && tx.outputs) {
      const totalOutputamount = tx.outputs.reduce((acc, output) => acc + BigInt(output.attoAlphAmount), BigInt(0))
      amount = removeConsolidationChangeAmount(totalOutputamount, tx.outputs)
      direction = 'out'
      infoType = 'move'
    } else {
      amount = calAmountDelta(tx, addressHash)
      direction = amount < 0 ? 'out' : 'in'
      amount = amount < 0 ? amount * BigInt(-1) : amount
      infoType = direction === 'out' && hasOnlyOutputsWith(outputs, addresses) ? 'move' : direction
    }
    lockTime = outputs.reduce(
      (a, b) => (a > new Date((b as AssetOutput).lockTime ?? 0) ? a : new Date((b as AssetOutput).lockTime ?? 0)),
      new Date(0)
    )
    lockTime = lockTime.toISOString() === new Date(0).toISOString() ? undefined : lockTime
  }

  return {
    amount,
    direction,
    infoType,
    outputs,
    lockTime
  }
}
