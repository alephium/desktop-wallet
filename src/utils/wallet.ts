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

import { Wallet } from 'alephium-js'
import { encrypt } from 'alephium-js/dist/lib/password-crypto'

//
// It's important to be explicit about what exactly is secure in this wallet, to
// avoid the developer assumption that the address and public key are also
// encrypted / secured.
//
export interface WalletSecureSecrets {
  address: string
  publicKey: string
  privateKeyEncrypted: string
  seed: Buffer
  mnemonicEncrypted: string
}

export const scrubWallet = (wallet: Wallet) => {
  Object.assign(wallet, {
    address: '',
    publicKey: '',
    privateKey: '',
    mnemonic: ''
  })
  wallet.seed.fill(0)
}

export const scrubWalletSecureSecrets = (wallet: WalletSecureSecrets) => {
  Object.assign(wallet, {
    address: '',
    publicKey: '',
    privateKeyEncrypted: '',
    mnemonicEncrypted: ''
  })
  wallet.seed.fill(0)
}

export const toWalletSecureSecrets = (
  password: string,
  { address, publicKey, privateKey, seed, mnemonic }: Wallet
): WalletSecureSecrets => ({
  address,
  publicKey,
  privateKeyEncrypted: encrypt(password, privateKey),
  seed: Buffer.from(seed),
  mnemonicEncrypted: encrypt(password, mnemonic)
})
