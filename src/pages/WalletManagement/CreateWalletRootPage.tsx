import { useContext, useEffect, useState } from 'react'
import { walletGenerate } from 'alephium-js'
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
import WalletWelcomePage from './WalletWelcomePage'
import { ReactComponent as AlephiumLogoSVG } from '../../images/alephium_logo_monochrome.svg'
import styled from 'styled-components'
import { deviceBreakPoints } from '../../style/globalStyles'
import AppHeader from '../../components/AppHeader'

const CreateWallet = () => {
  const { networkId } = useContext(GlobalContext)
  const [context, setContext] = useState<WalletManagementContextType>(initialWalletManagementContext)

  // Init wallet
  useEffect(() => {
    const result = walletGenerate(networkId)
    setContext((prevContext) => ({
      ...prevContext,
      plainWallet: result,
      mnemonic: result.mnemonic
    }))
  }, [networkId])

  const createWalletSteps: JSX.Element[] = [
    <CreateAccountPage key="create-account" />,
    <WalletWordsPage key="wallet-words" />,
    <CheckWordsIntroPage key="check-words-intro" />,
    <CheckWordsPage key="check-words" />,
    <WalletWelcomePage key="welcome" />
  ]

  return (
    <WalletManagementContext.Provider value={{ ...context, setContext }}>
      <AppHeader />
      <FloatingLogo />
      <MultiStepsController stepElements={createWalletSteps} baseUrl="create" />
    </WalletManagementContext.Provider>
  )
}

const FloatingLogo = styled(AlephiumLogoSVG)`
  position: absolute;
  top: 50px;
  left: 25px;
  width: 60px;
  height: 60px;

  path {
    fill: rgba(0, 0, 0, 0.05) !important;
  }

  @media ${deviceBreakPoints.mobile} {
    display: none;
  }
`

export default CreateWallet
