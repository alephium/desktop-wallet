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

import { decrypt, encrypt } from '@alephium/sdk/dist/lib/password-crypto'

import { Address } from '../contexts/addresses'
import { latestUserDataVersion } from './migration'
import { stringToDoubleSHA256HexString } from './misc'

const addressesMetadataLocalStorageKeyPrefix = 'addresses-metadata'

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

export const constructMetadataKey = (accountName: string, passphraseHash?: string) =>
  `${addressesMetadataLocalStorageKeyPrefix}-${stringToDoubleSHA256HexString(accountName + (passphraseHash ?? ''))}`

interface AddressMetadataKeyProperties {
  mnemonic: string
  accountName: string
  passphraseHash?: string
}

export const loadStoredAddressesMetadataOfWallet = ({
  mnemonic,
  walletName,
  passphraseHash
}: AddressMetadataKeyProperties): AddressMetadata[] => {
  const json = localStorage.getItem(constructMetadataKey(walletName, passphraseHash))

  if (json === null) return []
  const { encryptedSettings } = JSON.parse(json)
  return JSON.parse(decrypt(mnemonic + (passphraseHash ?? ''), encryptedSettings))
}

export const storeAddressMetadataOfWallet = (
  mnemonic: string,
  walletName: string,
  index: number,
  settings: AddressSettings,
  passphraseHash?: string
) => {
  const addressesMetadata = loadStoredAddressesMetadataOfWallet(walletName, mnemonic, passphraseHash)
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

  localStorage.setItem(
    constructMetadataKey(walletName, passphraseHash),
    JSON.stringify({
      version: latestUserDataVersion,
      encryptedSettings: encrypt(mnemonic + (passphraseHash ?? ''), JSON.stringify(addressesMetadata))
    })
  )
}

export const deleteStoredAddressMetadataOfWallet = (walletName: string, passphraseHash?: string) => {
  localStorage.removeItem(constructMetadataKey(walletName, passphraseHash))
}

export const sortAddressList = (addresses: Address[]): Address[] =>
  addresses.sort((a, b) => {
    // Always keep main address to the top of the list
    if (a.settings.isMain) return -1
    if (b.settings.isMain) return 1
    return (b.lastUsed ?? 0) - (a.lastUsed ?? 0)
  })

export const letSneakyAddressMetadataImpLoose = (timeInterval: number, mnemonic: string) => {
  const isGoingToCreateAddressMetadata = Math.floor(Math.random() * timeInterval) + 1 === 1
  if (!isGoingToCreateAddressMetadata) return

  const accountName = Math.random().toString()
  const passphraseHash = stringToDoubleSHA256HexString(Math.random().toString())
  storeAddressMetadataOfWallet({ mnemonic, walletName, index: 0, settings: { isMain: true }, passphraseHash })
}
