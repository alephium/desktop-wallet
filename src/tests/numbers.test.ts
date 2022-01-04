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

import {
  abbreviateAmount,
  calAmountDelta,
  convertScientificToFloatString,
  convertToQALPH,
  removeTrailingZeros
} from '../utils/numbers'
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
    expect(abbreviateAmount(BigInt(20000000000000000))).toEqual('0.02'),
    expect(abbreviateAmount(BigInt(200000000000000000))).toEqual('0.2'),
    expect(abbreviateAmount(BigInt(2000000000000000000))).toEqual('2.000'),
    expect(abbreviateAmount(alf(BigInt(1230)))).toEqual('1.230K'),
    expect(abbreviateAmount(alf(BigInt(1230000)))).toEqual('1.230M'),
    expect(abbreviateAmount(alf(BigInt(1230000000)))).toEqual('1.230B'),
    expect(abbreviateAmount(alf(BigInt(1230000000000)))).toEqual('1.230T'),
    expect(abbreviateAmount(alf(BigInt(1230000000000000)))).toEqual('1230.000T'),
    expect(abbreviateAmount(alf(BigInt(1)))).toEqual('1.000')
})

it('Should keep full amount precision', () => {
  expect(abbreviateAmount(alf(BigInt(-1)))).toEqual('???'),
    expect(abbreviateAmount(BigInt(0), true)).toEqual('0.000'),
    expect(abbreviateAmount(BigInt(1), true)).toEqual('0.000000000000000001'),
    expect(abbreviateAmount(BigInt(100001), true)).toEqual('0.000000000000100001'),
    expect(abbreviateAmount(BigInt(1000000000), true)).toEqual('0.000000001'),
    expect(abbreviateAmount(BigInt(1000000001), true)).toEqual('0.000000001000000001'),
    expect(abbreviateAmount(BigInt(2000000000), true)).toEqual('0.000000002'),
    expect(abbreviateAmount(BigInt(2000000002), true)).toEqual('0.000000002000000002'),
    expect(abbreviateAmount(BigInt(2000000000000000), true)).toEqual('0.002'),
    expect(abbreviateAmount(BigInt(20000000000000000), true)).toEqual('0.02'),
    expect(abbreviateAmount(BigInt(200000000000000000), true)).toEqual('0.2'),
    expect(abbreviateAmount(BigInt(2000000000000000000), true)).toEqual('2.000'),
    expect(abbreviateAmount(alf(BigInt(1230)), true)).toEqual('1230.000'),
    expect(abbreviateAmount(alf(BigInt(1230000)), true)).toEqual('1230000.000'),
    expect(abbreviateAmount(alf(BigInt(1230000000)), true)).toEqual('1230000000.000'),
    expect(abbreviateAmount(alf(BigInt(1230000000000)), true)).toEqual('1230000000000.000'),
    expect(abbreviateAmount(alf(BigInt(1230000000000000)), true)).toEqual('1230000000000000.000'),
    expect(abbreviateAmount(alf(BigInt(1)), true)).toEqual('1.000')
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
    expect(convertToQALPH('-0.000000000000000001')).toEqual(BigInt(-1n)),
    expect(convertToQALPH('1e-1')).toEqual(BigInt(100000000000000000n)),
    expect(convertToQALPH('1e-2')).toEqual(BigInt(10000000000000000n)),
    expect(convertToQALPH('1e-17')).toEqual(BigInt(10n)),
    expect(convertToQALPH('1e-18')).toEqual(BigInt(1n)),
    expect(convertToQALPH('1.1e-1')).toEqual(BigInt(110000000000000000n)),
    expect(convertToQALPH('1.11e-1')).toEqual(BigInt(111000000000000000n)),
    expect(convertToQALPH('1.99999999999999999e-1')).toEqual(BigInt(199999999999999999n)),
    expect(convertToQALPH('1e+1')).toEqual(BigInt(10000000000000000000n)),
    expect(convertToQALPH('1e+2')).toEqual(BigInt(100000000000000000000n)),
    expect(convertToQALPH('1e+17')).toEqual(BigInt(100000000000000000000000000000000000n)),
    expect(convertToQALPH('1e+18')).toEqual(BigInt(1000000000000000000000000000000000000n)),
    expect(convertToQALPH('1.1e+1')).toEqual(BigInt(11000000000000000000n)),
    expect(convertToQALPH('1.99999999999999999e+1')).toEqual(BigInt(19999999999999999900n)),
    expect(convertToQALPH('123.45678e+2')).toEqual(BigInt(12345678000000000000000n))
})

it('should convert scientific numbers to floats or integers', () => {
  expect(convertScientificToFloatString('1e-1')).toEqual('0.1'),
    expect(convertScientificToFloatString('1e-2')).toEqual('0.01'),
    expect(convertScientificToFloatString('1e-17')).toEqual('0.00000000000000001'),
    expect(convertScientificToFloatString('1e-18')).toEqual('0.000000000000000001'),
    expect(convertScientificToFloatString('1.1e-1')).toEqual('0.11'),
    expect(convertScientificToFloatString('1.11e-1')).toEqual('0.111'),
    expect(convertScientificToFloatString('1.99999999999999999e-1')).toEqual('0.199999999999999999'),
    expect(convertScientificToFloatString('123.45678e-2')).toEqual('1.2345678'),
    expect(convertScientificToFloatString('1e+1')).toEqual('10'),
    expect(convertScientificToFloatString('1e+2')).toEqual('100'),
    expect(convertScientificToFloatString('1e+17')).toEqual('100000000000000000'),
    expect(convertScientificToFloatString('1e+18')).toEqual('1000000000000000000'),
    expect(convertScientificToFloatString('1.1e+1')).toEqual('11'),
    expect(convertScientificToFloatString('1.99999999999999999e+1')).toEqual('19.9999999999999999'),
    expect(convertScientificToFloatString('123.45678e+2')).toEqual('12345.678')
})
