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

import { store } from '@/storage/store'
import { StoredWallet } from '@/types/wallet'

export interface EncryptedStorageProps {
  mnemonic: string
  walletId: string
  isPassphraseUsed?: boolean
}

type LocalStorageEncryptedValue = {
  version: string
  encrypted: string
}

export class PersistentEncryptedStorage {
  private localStorageKeyPrefix: string
  private version: string

  constructor(localStorageKeyPrefix: string, version: string) {
    this.localStorageKeyPrefix = localStorageKeyPrefix
    this.version = version
  }

  getKey(id: StoredWallet['id']) {
    if (!id) throw new Error('Wallet ID not set.')

    return `${this.localStorageKeyPrefix}-${id}`
  }

  load() {
    const { walletId, mnemonic, isPassphraseUsed } = getEncryptedStoragePropsFromActiveWallet()

    if (isPassphraseUsed) return []

    const json = localStorage.getItem(this.getKey(walletId))

    if (json === null) return []

    const { encrypted } = JSON.parse(json) as LocalStorageEncryptedValue

    return JSON.parse(decrypt(mnemonic, encrypted))
  }

  protected _store(data: string, { mnemonic, walletId, isPassphraseUsed }: EncryptedStorageProps) {
    if (isPassphraseUsed) return

    const encryptedValue: LocalStorageEncryptedValue = {
      version: this.version,
      encrypted: encrypt(mnemonic, data)
    }

    localStorage.setItem(this.getKey(walletId), JSON.stringify(encryptedValue))
  }

  delete(walletId: EncryptedStorageProps['walletId']) {
    localStorage.removeItem(this.getKey(walletId))
  }
}

export const getEncryptedStoragePropsFromActiveWallet = (): EncryptedStorageProps => {
  const { id, mnemonic, isPassphraseUsed } = store.getState().activeWallet

  if (!id || !mnemonic) throw new Error('Active wallet not found.')

  return { walletId: id, mnemonic, isPassphraseUsed }
}
