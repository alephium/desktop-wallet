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

import { decrypt, encrypt } from '@alephium/sdk'

import { stringToDoubleSHA256HexString } from '../utils/misc'

export interface DataKey {
  mnemonic: string
  walletName: string
}

export class PersistentEncryptedStorage {
  private localStorageKeyPrefix: string
  private version: string

  constructor(localStorageKeyPrefix: string, version: string) {
    this.localStorageKeyPrefix = localStorageKeyPrefix
    this.version = version
  }

  load({ mnemonic, walletName }: DataKey, isPassphraseUsed?: boolean) {
    if (isPassphraseUsed) return []

    const json = localStorage.getItem(getMetadataKey(this.localStorageKeyPrefix, walletName))

    if (json === null) return []
    const { encryptedSettings } = JSON.parse(json)
    return JSON.parse(decrypt(mnemonic, encryptedSettings))
  }

  protected store(data: string, { mnemonic, walletName }: DataKey, isPassphraseUsed?: boolean) {
    if (isPassphraseUsed) return

    const key = getMetadataKey(this.localStorageKeyPrefix, walletName)
    const encryptedValue = JSON.stringify({
      version: this.version,
      encryptedSettings: encrypt(mnemonic, data)
    })

    localStorage.setItem(key, encryptedValue)
  }

  delete(walletName: string) {
    localStorage.removeItem(getMetadataKey(this.localStorageKeyPrefix, walletName))
  }
}

const getMetadataKey = (localStorageKeyPrefix: string, walletName: string) =>
  `${localStorageKeyPrefix}-${stringToDoubleSHA256HexString(walletName)}`
