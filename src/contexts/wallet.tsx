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

import { Wallet } from '@alephium/sdk'
import { createContext, Dispatch, FC, SetStateAction, useContext, useState } from 'react'

export interface WalletContextType {
  plainWallet?: Wallet | undefined
  setPlainWallet: Dispatch<SetStateAction<Wallet | undefined>>
  mnemonic: string
  setMnemonic: Dispatch<SetStateAction<string>>
  accountName: string
  setAccountName: Dispatch<SetStateAction<string>>
  password: string
  setPassword: Dispatch<SetStateAction<string>>
  passphrase: string
  setPassphrase: Dispatch<SetStateAction<string>>
}

export const initialWalletContext: WalletContextType = {
  mnemonic: '',
  setMnemonic: () => null,
  accountName: '',
  setAccountName: () => null,
  password: '',
  setPassword: () => null,
  setPlainWallet: () => null,
  passphrase: '',
  setPassphrase: () => null
}

export const WalletContext = createContext<WalletContextType>(initialWalletContext)

export const WalletContextProvider: FC = ({ children }) => {
  const [accountName, setAccountName] = useState('')
  const [password, setPassword] = useState('')
  const [plainWallet, setPlainWallet] = useState<Wallet>()
  const [mnemonic, setMnemonic] = useState('')
  const [passphrase, setPassphrase] = useState('')

  return (
    <WalletContext.Provider
      value={{
        accountName,
        setAccountName,
        password,
        setPassword,
        mnemonic,
        setMnemonic,
        plainWallet,
        setPlainWallet,
        passphrase,
        setPassphrase
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export const useWalletContext = () => useContext(WalletContext)
