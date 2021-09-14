import React from 'react'
import { Wallet } from 'alephium-js'

export interface WalletManagementContextType {
  plainWallet?: Wallet
  mnemonic: string
  username: string
  password: string
  setContext: React.Dispatch<React.SetStateAction<WalletManagementContextType>>
}

export const initialWalletManagementContext: WalletManagementContextType = {
  mnemonic: '',
  username: '',
  password: '',
  setContext: () => null
}

export const WalletManagementContext = React.createContext<WalletManagementContextType>(initialWalletManagementContext)
