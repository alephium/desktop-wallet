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
