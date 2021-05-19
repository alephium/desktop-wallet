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

const ImportWalletRootPage = () => {
  const [context, setContext] = useState<WalletManagementContextType>(initialWalletManagementContext)

  const importWalletSteps: JSX.Element[] = [
    <CreateAccountPage key="create-account" />,
    <ImportWordsPage key="import-words" />,
    <WalletWelcomePage key="welcome" />
  ]

  return (
    <WalletManagementContext.Provider value={{ ...context, setContext }}>
      <MultiStepsController stepElements={importWalletSteps} baseUrl="import" />
    </WalletManagementContext.Provider>
  )
}

export default ImportWalletRootPage
