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

import { Wallet, walletOpen } from '@alephium/sdk'
import { orderBy } from 'lodash'
import { nanoid } from 'nanoid'
import posthog from 'posthog-js'

import { StoredWallet, UnencryptedWallet } from '@/types/wallet'

class WalletStorage {
  private static localStorageKey = 'wallet'

  getKey(id: StoredWallet['id']) {
    if (!id) throw new Error('Wallet ID not set.')

    return `${WalletStorage.localStorageKey}-${id}`
  }

  list(): StoredWallet[] {
    const wallets = []

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)

      if (key?.startsWith(WalletStorage.localStorageKey)) {
        const data = localStorage.getItem(key)

        if (!data) continue

        try {
          const wallet = JSON.parse(data) as StoredWallet
          if (!wallet.name) continue

          wallets.push(wallet)
        } catch (e) {
          console.error(e)
          posthog.capture('Error', { message: 'Parsing stored wallet data' })
          continue
        }
      }
    }

    return orderBy(wallets, (w) => w.name.toLowerCase())
  }

  load(id: StoredWallet['id'], password: string): UnencryptedWallet {
    if (!password) throw new Error(`Unable to load wallet ${id}, password not set.`)

    const data = localStorage.getItem(this.getKey(id))

    if (!data) throw new Error(`Unable to load wallet ${id}, wallet doesn't exist.`)

    const wallet = JSON.parse(data) as StoredWallet

    return {
      name: wallet.name,
      ...walletOpen(password, wallet.encrypted)
    }
  }

  store(name: StoredWallet['name'], password: string, wallet: Wallet): StoredWallet {
    if (!password) throw new Error(`Unable to store wallet ${name}, password not set.`)

    const id = nanoid()

    const dataToStore: StoredWallet = {
      id,
      name,
      encrypted: wallet.encrypt(password),
      lastUsed: Date.now()
    }

    localStorage.setItem(this.getKey(id), JSON.stringify(dataToStore))

    return dataToStore
  }

  delete(id: StoredWallet['id']) {
    localStorage.removeItem(this.getKey(id))
  }

  update(id: StoredWallet['id'], data: Omit<Partial<StoredWallet>, 'encrypted' | 'id'>) {
    const key = this.getKey(id)
    const walletRaw = localStorage.getItem(key)

    if (!walletRaw) throw new Error(`Unable to load wallet ${id}, wallet doesn't exist.`)

    const wallet = JSON.parse(walletRaw) as StoredWallet

    localStorage.setItem(
      key,
      JSON.stringify({
        ...wallet,
        ...data
      })
    )
  }
}

const Storage = new WalletStorage()

export default Storage
