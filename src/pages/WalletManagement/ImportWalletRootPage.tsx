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
