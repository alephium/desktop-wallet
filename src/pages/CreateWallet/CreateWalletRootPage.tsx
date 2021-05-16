import React, { useContext, useEffect, useState } from 'react'
import { MainContainer } from '../../components/PageComponents'
import { walletGenerate, Wallet } from 'alf-client'
import { useHistory, useParams } from 'react-router'
import CreateAccountPage from './CreateAccountPage'
import WalletWordsPage from './WalletWordsPage'
import { GlobalContext } from '../../App'
import CheckWordsIntroPage from './CheckWordsIntroPage'
import CheckWordsPage from './CheckWordsPage'
import MultiStepsController from '../MultiStepsController'

interface RouteParams {
  step: string | undefined
}

interface Context {
  plainWallet?: Wallet
  mnemonic: string
  username: string
  password: string
  setContext: React.Dispatch<React.SetStateAction<Context>>
}

const initialContext: Context = {
  mnemonic: '',
  username: '',
  password: '',
  setContext: () => null
}

export const CreateWalletContext = React.createContext<Context>(initialContext)

// ============== //
/* MAIN COMPONENT */
// ============== //

const CreateWallet = () => {
  const { networkType } = useContext(GlobalContext)

  const [context, setContext] = useState<Context>(initialContext)

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
    <CreateWalletContext.Provider value={{ ...context, setContext }}>
      <MultiStepsController stepElements={createWalletSteps} baseUrl="create" />
    </CreateWalletContext.Provider>
  )
}

export default CreateWallet
