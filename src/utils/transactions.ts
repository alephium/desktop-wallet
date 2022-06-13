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

import { convertAlphToSet, MIN_UTXO_SET_AMOUNT } from '@alephium/sdk'

import { Address } from '../contexts/addresses'
import { GasInfo } from '../types/transactions'

export const isAmountWithinRange = (amount: bigint, maxAmount: bigint): boolean => {
  return amount >= MIN_UTXO_SET_AMOUNT && amount <= maxAmount
}

export const getAmountErrorMessage = (amount: string, minAmount: bigint, shouldConvertToSet: boolean): string => {
  try {
    const amountNumber = shouldConvertToSet ? convertAlphToSet(amount || '0') : BigInt(amount)
    if (amountNumber < minAmount) {
      return `The amount must be greater than ${minAmount}`
    }
  } catch (e) {
    return 'Unable to convert the amount'
  }
  return ''
}

export const hasNoGasErrors = ({ gasAmount, gasPrice }: GasInfo) => !gasAmount.error && !gasPrice.error

export const expectedAmount = (data: { fromAddress: Address; alphAmount?: string }, fees: bigint): bigint => {
  const amountInSet = data.alphAmount ? convertAlphToSet(data.alphAmount) : 0n
  const amountIncludingFees = amountInSet + fees
  const exceededBy = amountIncludingFees - data.fromAddress.availableBalance
  const expectedAmount = exceededBy > 0 ? data.fromAddress.availableBalance - exceededBy : amountInSet
  return expectedAmount
}
