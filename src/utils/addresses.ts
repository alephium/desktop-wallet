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

export type AddressInfo = {
  index: number
  isMain: boolean
  label?: string
  color?: string
}

export const checkAddressValidity = (address: string) => {
  const match = address.match(/^[1-9A-HJ-NP-Za-km-z]+$/)

  if (match === null) return false

  return match[0] === address && address
}

export const loadStoredAddressesInfoOfAccount = (username: string): AddressInfo[] => {
  const storedAddressIndexes = localStorage.getItem(`${username}-address-info`)

  if (storedAddressIndexes === null) return []

  return JSON.parse(storedAddressIndexes)
}

export const storeAddressInfoOfAccount = (
  addressIndex: number,
  username: string,
  label?: string,
  color?: string,
  isMain = false
) => {
  const addressesInfo = loadStoredAddressesInfoOfAccount(username)
  const existingAddressInfo = addressesInfo.find((info: AddressInfo) => info.index === addressIndex)

  if (!existingAddressInfo) {
    addressesInfo.push({
      index: addressIndex,
      label,
      color,
      isMain
    })
  } else if (
    existingAddressInfo.label !== label ||
    existingAddressInfo.color !== color ||
    existingAddressInfo.isMain !== isMain
  ) {
    existingAddressInfo.label = label
    existingAddressInfo.color = color
    existingAddressInfo.isMain = isMain
  }
  localStorage.setItem(`${username}-address-info`, JSON.stringify(addressesInfo))
}
