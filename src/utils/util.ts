// Copyright 2021 The Alephium Authors
// This file is part of the alephium project.
//
// The library is free software: you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// The library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public License
// along with the library. If not, see <http://www.gnu.org/licenses/>.

import { Transaction } from 'alf-client/dist/api/api-explorer'

// ==================== //
// === STRING MANIP === //
// ==================== //

const MONEY_SYMBOL_BIG = ['', 'K', 'M', 'B', 'T']
const MONEY_SYMBOL_SMALL = ['', 'm', 'μ', 'n', 'p', 'q']

export const abbreviateAmount = (num: number) => {
  if (num < 0) return '0.00'

  // what tier? (determines SI symbol)
  let tier = (Math.round(Math.log10(Number(num))) / 3) | 0

  if (tier < 0 && Math.abs(tier) >= MONEY_SYMBOL_SMALL.length) tier = -MONEY_SYMBOL_SMALL.length + 1
  else if (tier == 0) return num.toFixed(3).toString()
  else if (tier >= MONEY_SYMBOL_BIG.length) tier = MONEY_SYMBOL_BIG.length - 1

  // get suffix and determine scale
  const suffix = tier >= 0 ? MONEY_SYMBOL_BIG[tier] : MONEY_SYMBOL_SMALL[Math.abs(tier)]

  const scale = Math.pow(10, tier * 3)

  // scale the bigNum
  const scaled = num / scale
  return scaled.toFixed(3) + suffix
}

export const truncate = (str: string) => {
  const len = str.length
  return len > 10 ? str.substring(0, 6) + '...' + str.substring(len - 6, len) : str
}

// ==================== //
// ===== BALANCES ===== //
// ==================== //

export function calAmountDelta(t: Transaction, id: string) {
  if (t.inputs && t.outputs) {
    const inputAmount = t.inputs.reduce<number>((acc, input) => {
      return input.amount && input.address === id ? acc + input.amount : acc
    }, 0)
    const outputAmount = t.outputs.reduce<number>((acc, output) => {
      return output.address === id ? acc + output.amount : acc
    }, 0)

    return outputAmount - inputAmount
  } else {
    throw 'Missing transaction details'
  }
}

// ================= //
// ===== LINKS ===== //
// ================= //

export const openInNewWindow = (url: string) => {
  if (url) {
    const newWindow = window.open(`${url}`, '_blank', 'noopener,noreferrer')
    if (newWindow) newWindow.opener = null
  }
}
