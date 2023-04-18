/*
Copyright 2018 - 2023 The Alephium Authors
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

import {
  EncryptedStorageProps,
  StatelessPersistentEncryptedStorage
} from '@/storage/statelessEncryptedPersistentStorage'
import { store } from '@/storage/store'

export class PersistentEncryptedStorage extends StatelessPersistentEncryptedStorage {
  load() {
    return this._load(getEncryptedStoragePropsFromActiveWallet())
  }

  protected _store(data: string) {
    this._storeStateless(data, getEncryptedStoragePropsFromActiveWallet())
  }
}

export const getEncryptedStoragePropsFromActiveWallet = (): EncryptedStorageProps => {
  const { id, mnemonic, isPassphraseUsed } = store.getState().activeWallet

  if (!id || !mnemonic) throw new Error('Active wallet not found.')

  return { walletId: id, mnemonic, isPassphraseUsed }
}
