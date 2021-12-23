/*
Copyright 2018 - 2021 The Alephium Authors
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

import { abbreviateAmount, calAmountDelta, convertToQALPH, removeTrailingZeros } from '../utils/numbers'
import transactions from './fixtures/transactions.json'

const alf = (amount: bigint) => {
  return amount * BigInt(1000000000000000000)
}

const minDigits = 3

it('Should abbreviate amount', () => {
  expect(abbreviateAmount(alf(BigInt(-1)))).toEqual('???'),
    expect(abbreviateAmount(BigInt(0))).toEqual('0.000'),
    expect(abbreviateAmount(BigInt(1))).toEqual('0.000000000000000001'),
    expect(abbreviateAmount(BigInt(100000))).toEqual('0.0000000000001'),
    expect(abbreviateAmount(BigInt(1000000000))).toEqual('0.000000001'),
    expect(abbreviateAmount(BigInt(2000000000))).toEqual('0.000000002'),
    expect(abbreviateAmount(BigInt(2000000000000000))).toEqual('0.002'),
    expect(abbreviateAmount(alf(BigInt(1230)))).toEqual('1.230K'),
    expect(abbreviateAmount(alf(BigInt(1230000)))).toEqual('1.230M'),
    expect(abbreviateAmount(alf(BigInt(1230000000)))).toEqual('1.230B'),
    expect(abbreviateAmount(alf(BigInt(1230000000000)))).toEqual('1.230T'),
    expect(abbreviateAmount(alf(BigInt(1230000000000000)))).toEqual('1230.000T'),
    expect(abbreviateAmount(alf(BigInt(1)))).toEqual('1.000')
})

it('Should remove trailing zeros', () => {
  expect(removeTrailingZeros('0.00010000', minDigits)).toEqual('0.0001'),
    expect(removeTrailingZeros('10000.000', minDigits)).toEqual('10000.000'),
    expect(removeTrailingZeros('-10000.0001000', minDigits)).toEqual('-10000.0001'),
    expect(removeTrailingZeros('-0.0001020000', minDigits)).toEqual('-0.000102')
})

it('should calucate the amount delta between the inputs and outputs of an address in a transaction', () => {
  expect(calAmountDelta(transactions.oneInputOneOutput, transactions.oneInputOneOutput.inputs[0].address)).toEqual(
    alf(BigInt(-50))
  ),
    expect(calAmountDelta(transactions.twoInputsOneOutput, transactions.twoInputsOneOutput.inputs[0].address)).toEqual(
      alf(BigInt(-150))
    ),
    expect(
      calAmountDelta(transactions.twoInputsZeroOutput, transactions.twoInputsZeroOutput.inputs[0].address)
    ).toEqual(alf(BigInt(-200))),
    expect(() =>
      calAmountDelta(transactions.missingInputs, transactions.missingInputs.outputs[0].address)
    ).toThrowError('Missing transaction details'),
    expect(() =>
      calAmountDelta(transactions.missingOutputs, transactions.missingOutputs.inputs[0].address)
    ).toThrowError('Missing transaction details')
})

it('should convert to qALPH', () => {
  expect(convertToQALPH('-1')).toEqual(BigInt(-1000000000000000000n)),
    expect(convertToQALPH('0')).toEqual(BigInt(0)),
    expect(convertToQALPH('1')).toEqual(BigInt(1000000000000000000n)),
    expect(convertToQALPH('10')).toEqual(BigInt(10000000000000000000n)),
    expect(convertToQALPH('999999999')).toEqual(BigInt(999999999000000000000000000n)),
    expect(convertToQALPH('999999999999')).toEqual(BigInt(999999999999000000000000000000n)),
    expect(convertToQALPH('0.1')).toEqual(BigInt(100000000000000000n)),
    expect(convertToQALPH('0.01')).toEqual(BigInt(10000000000000000n)),
    expect(convertToQALPH('0.00000009')).toEqual(BigInt(90000000000n)),
    expect(convertToQALPH('0.000000000000000001')).toEqual(BigInt(1n)),
    expect(convertToQALPH('-0.000000000000000001')).toEqual(BigInt(-1n))
})
