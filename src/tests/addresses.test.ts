import { checkAddressValidity } from '../utils/addresses'

it('Should return address string if correct', () => {
  expect(checkAddressValidity('1EfGPJaeHYN8MQfZmUT58HNbAWkJAbuJ7hCLoAaQwHFXz')).toEqual(
    '1EfGPJaeHYN8MQfZmUT58HNbAWkJAbuJ7hCLoAaQwHFXz'
  ),
    expect(checkAddressValidity('1EfGPJaeHYN8MQfZmUT58HNbAWkJAbuJ7hCLoAaQwHFX')).toEqual(
      '1EfGPJaeHYN8MQfZmUT58HNbAWkJAbuJ7hCLoAaQwHFX'
    ),
    expect(
      checkAddressValidity(
        'WzbegYW2DgnouXKdMQGHcXKfgmTkvAomrvG9Dtw4vGpCrHdq4EzoFdaZPsR5zZHuVvEYD5Dw7Yf3X4PapL5M9RF62GsPaTtHdXYuxXfbbynwQ9WkiEai9Q9iD5yE55nNwGZkC9'
      )
    ).toEqual(
      'WzbegYW2DgnouXKdMQGHcXKfgmTkvAomrvG9Dtw4vGpCrHdq4EzoFdaZPsR5zZHuVvEYD5Dw7Yf3X4PapL5M9RF62GsPaTtHdXYuxXfbbynwQ9WkiEai9Q9iD5yE55nNwGZkC9'
    ),
    expect(checkAddressValidity('1EfGPJaeHYN8MQfZmUT58HNbAWkJAbuJkhCLoAaQwHFX0')).toEqual(false),
    expect(checkAddressValidity('1EfGPJaeHYN8MQfZmUT58HNbAWkJAbuJkhCLoAaQwHFXl')).toEqual(false),
    expect(checkAddressValidity('1EfGPJaeHYN8MQfZmUT58HNbAWkJAbuJkhCLoAaQwHFXI')).toEqual(false),
    expect(checkAddressValidity('1EfGPJaeHYN8MQfZmUT58HNbAW-JAbuJ7hCLoAaQwHFXz')).toEqual(false),
    expect(checkAddressValidity('1EfGPJaeHYN8MQfZmUT58HNbAWkJAbuJ7hCLoAaQwHFXz ')).toEqual(false)
})
