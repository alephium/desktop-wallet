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

import { MempoolTransaction } from '@alephium/web3/dist/src/api/api-explorer'
import posthog from 'posthog-js'

import { getEncryptedStoragePropsFromActiveWallet } from '@/storage/encryptedPersistentStorage'
import { store } from '@/storage/store'
import PendingTransactionsStorage from '@/storage/transactions/pendingTransactionsPersistentStorage'
import {
  loadingPendingTransactionsFailed,
  storedPendingTransactionsLoaded
} from '@/storage/transactions/transactionsActions'
import { PendingTransaction } from '@/types/transactions'

export const getStoredPendingTransactions = () => {
  const encryptedStorageProps = getEncryptedStoragePropsFromActiveWallet()

  return PendingTransactionsStorage.load(encryptedStorageProps)
}

export const restorePendingTransactions = (
  mempoolTxHashes: MempoolTransaction['hash'][],
  storedPendingTxs: PendingTransaction[]
) => {
  try {
    const encryptedStorageProps = getEncryptedStoragePropsFromActiveWallet()
    const usefulPendingTxs = storedPendingTxs.filter((tx) => mempoolTxHashes.includes(tx.hash))

    store.dispatch(storedPendingTransactionsLoaded(usefulPendingTxs))
    PendingTransactionsStorage.store(usefulPendingTxs, encryptedStorageProps)
  } catch (e) {
    console.error(e)
    store.dispatch(loadingPendingTransactionsFailed())
    posthog.capture('Error', { message: 'Restoring pending transactions' })
  }
}
