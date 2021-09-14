import React, { useState } from 'react'
import {
  WalletManagementContext,
  WalletManagementContextType,
  initialWalletManagementContext
} from './WalletManagementContext'
import CreateAccountPage from './CreateAccountPage'
import MultiStepsController from '../MultiStepsController'
import ImportWordsPage from './ImportWordsPage'
import WalletWelcomePage from './WalletWelcomePage'
import { ReactComponent as AlephiumLogoSVG } from '../../images/alephium_logo_monochrome.svg'
import AppHeader from '../../components/AppHeader'
import { deviceBreakPoints } from '../../style/globalStyles'
import styled from 'styled-components'

const ImportWalletRootPage = () => {
  const [context, setContext] = useState<WalletManagementContextType>(initialWalletManagementContext)

  const importWalletSteps: JSX.Element[] = [
    <CreateAccountPage key="create-account" isRestoring />,
    <ImportWordsPage key="import-words" />,
    <WalletWelcomePage key="welcome" />
  ]

  return (
    <WalletManagementContext.Provider value={{ ...context, setContext }}>
      <AppHeader />
      <FloatingLogo />
      <MultiStepsController stepElements={importWalletSteps} baseUrl="import" />
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

export default ImportWalletRootPage
