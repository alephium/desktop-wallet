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

import { Wallet, walletOpen } from '@alephium/sdk'

type WalletName = string

class WalletStorage {
  private static localStorageKey = 'wallet'

  getKey(name: WalletName) {
    if (!name) throw new Error('Wallet name not set.')

    return `${WalletStorage.localStorageKey}-${name}`
  }

  list(): WalletName[] {
    const prefixLength = WalletStorage.localStorageKey.length + 1
    const walletNames = []

    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i)

      if (key && key.startsWith(WalletStorage.localStorageKey)) {
        walletNames.push(key.substring(prefixLength))
      }
    }

    return walletNames
  }

  load(name: WalletName, password: string): Wallet {
    if (!password) throw new Error(`Unable to load wallet ${name}, password not set.`)

    const encryptedWallet = window.localStorage.getItem(this.getKey(name))

    if (!encryptedWallet) throw new Error(`Unable to load wallet ${name}, wallet doesn't exist.`)

    return walletOpen(password, encryptedWallet)
  }

  store(name: WalletName, password: string, wallet: Wallet) {
    if (!password) throw new Error(`Unable to store wallet ${name}, password not set.`)

    window.localStorage.setItem(this.getKey(name), wallet.encrypt(password))
  }

  delete(name: WalletName) {
    localStorage.removeItem(this.getKey(name))
  }
}

const Storage = new WalletStorage()

export default Storage
