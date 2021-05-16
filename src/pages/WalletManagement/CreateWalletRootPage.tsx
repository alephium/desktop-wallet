import { useContext, useEffect, useState } from 'react'
import { walletGenerate } from 'alf-client'
import CreateAccountPage from './CreateAccountPage'
import WalletWordsPage from './WalletWordsPage'
import { GlobalContext } from '../../App'
import CheckWordsIntroPage from './CheckWordsIntroPage'
import CheckWordsPage from './CheckWordsPage'
import MultiStepsController from '../MultiStepsController'
import {
  initialWalletManagementContext,
  WalletManagementContext,
  WalletManagementContextType
} from './WalletManagementContext'

const CreateWallet = () => {
  const { networkType } = useContext(GlobalContext)
  const [context, setContext] = useState<WalletManagementContextType>(initialWalletManagementContext)

  // Init wallet
  useEffect(() => {
    const result = walletGenerate(networkType)
    setContext((prevContext) => ({
      ...prevContext,
      plainWallet: result.wallet,
      mnemonic: result.mnemonic
    }))
  }, [networkType])

  const createWalletSteps: JSX.Element[] = [
    <CreateAccountPage key="create-account" />,
    <WalletWordsPage key="wallet-words" />,
    <CheckWordsIntroPage key="check-words-intro" />,
    <CheckWordsPage key="check-words" />
  ]

  return (
    <WalletManagementContext.Provider value={{ ...context, setContext }}>
      <MultiStepsController stepElements={createWalletSteps} baseUrl="create" />
    </WalletManagementContext.Provider>
  )
}

export default CreateWallet
