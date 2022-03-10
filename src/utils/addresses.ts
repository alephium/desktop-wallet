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

const addressesMetadataLocalStorageKeySuffix = 'addresses-metadata'

export type AddressSettings = {
  isMain: boolean
  label?: string
  color?: string
}

type AddressMetadata = AddressSettings & {
  index: number
}

export const checkAddressValidity = (address: string) => {
  const match = address.match(/^[1-9A-HJ-NP-Za-km-z]+$/)

  if (match === null) return false

  return match[0] === address && address
}

export const loadStoredAddressesMetadataOfAccount = (accountName: string): AddressMetadata[] => {
  const data = localStorage.getItem(`${accountName}-${addressesMetadataLocalStorageKeySuffix}`)

  if (data === null) return []

  return JSON.parse(data)
}

export const storeAddressMetadataOfAccount = (accountName: string, index: number, settings: AddressSettings) => {
  const addressesMetadata = loadStoredAddressesMetadataOfAccount(accountName)
  const existingAddressMetadata = addressesMetadata.find((data: AddressMetadata) => data.index === index)

  if (!existingAddressMetadata) {
    addressesMetadata.push({
      index,
      ...settings
    })
  } else {
    Object.assign(existingAddressMetadata, settings)
  }
  console.log(`🟠 Storing address index ${index} metadata locally`)
  localStorage.setItem(`${accountName}-${addressesMetadataLocalStorageKeySuffix}`, JSON.stringify(addressesMetadata))
}

export const deleteStoredAddressMetadataOfAccount = (accountName: string) => {
  localStorage.removeItem(`${accountName}-${addressesMetadataLocalStorageKeySuffix}`)
}
