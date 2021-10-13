import { abbreviateAmount, removeTrailingZeros } from '../utils/numbers'

const alf = (amount: bigint) => {
  return amount * BigInt(1000000000000000000)
}

it('Should abbreviate amount', () => {
  expect(abbreviateAmount(alf(BigInt(-1)))).toEqual('0.00'),
    expect(abbreviateAmount(BigInt(0))).toEqual('0.00'),
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
    expect(abbreviateAmount(alf(BigInt(1)))).toEqual('1.00')
})

it('Should remove trailing zeros', () => {
  expect(removeTrailingZeros('0.00010000')).toEqual('0.0001'),
    expect(removeTrailingZeros('10000.000')).toEqual('10000.00'),
    expect(removeTrailingZeros('-10000.0001000')).toEqual('-10000.0001'),
    expect(removeTrailingZeros('-0.0001020000')).toEqual('-0.000102')
})
