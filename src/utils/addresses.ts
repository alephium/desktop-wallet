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

export type AddressSettings = {
  isMain: boolean
  label?: string
  color?: string
}

type AddressIndexAndSettings = AddressSettings & {
  index: number
}

export const checkAddressValidity = (address: string) => {
  const match = address.match(/^[1-9A-HJ-NP-Za-km-z]+$/)

  if (match === null) return false

  return match[0] === address && address
}

export const loadStoredAddressesIndexAndSettingsOfAccount = (username: string): AddressIndexAndSettings[] => {
  const data = localStorage.getItem(`${username}-address-indexes-and-settings`)

  if (data === null) return []

  return JSON.parse(data)
}

export const storeAddressIndexAndSettingsOfAccount = (username: string, index: number, settings: AddressSettings) => {
  const addressesIndexAndSettings = loadStoredAddressesIndexAndSettingsOfAccount(username)
  const existingAddressIndexAndSettings = addressesIndexAndSettings.find(
    (data: AddressIndexAndSettings) => data.index === index
  )

  if (!existingAddressIndexAndSettings) {
    addressesIndexAndSettings.push({
      index,
      ...settings
    })
  } else {
    Object.assign(existingAddressIndexAndSettings, settings)
  }
  localStorage.setItem(`${username}-address-indexes-and-settings`, JSON.stringify(addressesIndexAndSettings))
}
