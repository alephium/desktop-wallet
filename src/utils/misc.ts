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

const getNumberOfTrailingZeros = (numberArray: string[]) => {
  let numberOfZeros = 0

  for (let i = numberArray.length - 1; i >= 0; i--) {
    if (numberArray[i] === '0') {
      numberOfZeros++
    } else {
      break
    }
  }

  return numberOfZeros
}

const removeTrailingZeros = (numString: string) => {
  const numberArray = numString.split('')

  const numberOfZeros = getNumberOfTrailingZeros(numberArray)

  const numberArrayWithoutTrailingZeros = [...numberArray.slice(0, numberArray.length - numberOfZeros)]

  if (numberArrayWithoutTrailingZeros[numberArrayWithoutTrailingZeros.length - 1] === '.')
    numberArrayWithoutTrailingZeros.push('0')

  return numberArrayWithoutTrailingZeros.join().replaceAll(',', '')
}

const MONEY_SYMBOL = ['', 'K', 'M', 'B', 'T']

const QUINTILLION = 1000000000000000000

export const abbreviateAmount = (baseNum: bigint, showFullPrecision = false, nbOfDecimals?: number) => {
  const maxDecimals = 6

  if (baseNum < 0n) return '0.00'

  // For abbreviation, we don't need full precision and can work with number
  const alephNum = Number(baseNum) / QUINTILLION

  // what tier? (determines SI symbol)
  let tier = (Math.log10(alephNum) / 3) | 0

  const numberArray = baseNum.toString().split('')

  const numberOfZeros = getNumberOfTrailingZeros(numberArray)
  const numberOfNonZero = numberArray.length - numberOfZeros

  const numberOfDigitsToDisplay = nbOfDecimals
    ? nbOfDecimals
    : numberOfNonZero < maxDecimals
    ? numberOfNonZero
    : maxDecimals

  if (tier < 0) {
    return removeTrailingZeros(alephNum.toFixed(8))
  } else if (tier === 0) {
    // Small number, low precision is ok
    return removeTrailingZeros(alephNum.toFixed(numberOfDigitsToDisplay).toString())
  } else if (tier >= MONEY_SYMBOL.length) {
    tier = MONEY_SYMBOL.length - 1
  }

  // get suffix and determine scale
  const suffix = MONEY_SYMBOL[tier]
  const scale = Math.pow(10, tier * 3)

  // scale the bigNum
  // Here we need to be careful of precision issues
  const scaled = alephNum / scale

  if (showFullPrecision) {
    // Work with string to avoid rounding issues
    const nonDigitLength = Math.round(scaled).toString().length
    const numberArrayWithDecimals = [...numberArray.slice(0, nonDigitLength), '.', ...numberArray.slice(nonDigitLength)]
    return removeTrailingZeros(numberArrayWithDecimals.join().replaceAll(',', '')) + suffix
  }

  return scaled.toFixed(numberOfDigitsToDisplay) + suffix
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
    const inputAmount = t.inputs.reduce<bigint>((acc, input) => {
      return input.amount && input.address === id ? acc + BigInt(input.amount) : acc
    }, 0n)
    const outputAmount = t.outputs.reduce<bigint>((acc, output) => {
      return output.address === id ? acc + BigInt(output.amount) : acc
    }, 0n)

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

// =================== //
// ===== NUMBERS ===== //
// =================== //

export const numberToPlainString = (num: number) => {
  return ('' + +num).replace(/(-?)(\d*)\.?(\d*)e([+-]\d+)/, function (a, b, c, d, e) {
    return e < 0 ? b + '0.' + Array(1 - e - c.length).join('0') + c + d : b + c + d + Array(e - d.length + 1).join('0')
  })
}
