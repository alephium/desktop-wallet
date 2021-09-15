import { checkAddressValidity } from '../utils/misc'

it('Should return address string if correct', () => {
  expect(checkAddressValidity('1EfGPJaeHYN8MQfZmUT58HNbAWkJAbuJ7hCLoAaQwHFXz')).toEqual(
    '1EfGPJaeHYN8MQfZmUT58HNbAWkJAbuJ7hCLoAaQwHFXz'
  ),
    expect(checkAddressValidity('1EfGPJaeHYN8MQfZmUT58HNbAWkJAbuJ7hCLoAaQwHFX')).toEqual(
      '1EfGPJaeHYN8MQfZmUT58HNbAWkJAbuJ7hCLoAaQwHFX'
    ),
    expect(checkAddressValidity('1EfGPJaeHYN8MQfZmUT58HNbAWkJAbuJkhCLoAaQwHFX0')).toEqual(false),
    expect(checkAddressValidity('1EfGPJaeHYN8MQfZmUT58HNbAWkJAbuJkhCLoAaQwHFXl')).toEqual(false),
    expect(checkAddressValidity('1EfGPJaeHYN8MQfZmUT58HNbAWkJAbuJkhCLoAaQwHFXI')).toEqual(false),
    expect(checkAddressValidity('1EfGPJaeHYN8MQfZmUT58HNbAW-JAbuJ7hCLoAaQwHFXz')).toEqual(false),
    expect(checkAddressValidity('1EfGPJaeHYN8MQfZmUT58HNbAWkJAbuJ7hCLoAaQwHFXz ')).toEqual(false),
    expect(checkAddressValidity('Q1EfGPJaeHYN8MQfZmUT58HNbAWkJAbuJ7hCLoAaQwHFXz')).toEqual(false)
})
