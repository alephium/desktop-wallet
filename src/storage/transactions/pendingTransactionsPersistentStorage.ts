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
import { PendingTransaction } from '@/types/transactions'

class PendingTransactionsStorage extends StatelessPersistentEncryptedStorage {
  load(encryptedStorageProps: EncryptedStorageProps) {
    return this._load(encryptedStorageProps) as PendingTransaction[]
  }

  store(transactions: PendingTransaction[], encryptedStorageProps: EncryptedStorageProps) {
    this._storeStateless(JSON.stringify(transactions), encryptedStorageProps)
  }
}

const version = '1'
const Storage = new PendingTransactionsStorage('pending-transactions', version)

export default Storage
