// Copyright 2018 - 2021 The Alephium Authors
// This file is part of the alephium project.
//
// The library is free software: you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// The library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public License
// along with the library. If not, see <http://www.gnu.org/licenses/>.

import { walletGenerate } from 'alephium-js'
import { useEffect, useState } from 'react'

import AppHeader from '../../components/AppHeader'
import FloatingLogo from '../../components/FloatingLogo'
import MultiStepsController from '../MultiStepsController'
import CheckWordsIntroPage from './CheckWordsIntroPage'
import CheckWordsPage from './CheckWordsPage'
import CreateAccountPage from './CreateAccountPage'
import {
  initialWalletManagementContext,
  WalletManagementContext,
  WalletManagementContextType
} from './WalletManagementContext'
import WalletWelcomePage from './WalletWelcomePage'
import WalletWordsPage from './WalletWordsPage'

const CreateWallet = () => {
  const [context, setContext] = useState<WalletManagementContextType>(initialWalletManagementContext)

  // Init wallet
  useEffect(() => {
    const result = walletGenerate()
    setContext((prevContext) => ({
      ...prevContext,
      plainWallet: result,
      mnemonic: result.mnemonic
    }))
  }, [])

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

export default CreateWallet
