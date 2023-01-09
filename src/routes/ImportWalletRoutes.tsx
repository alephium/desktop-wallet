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

import AppHeader from '@/components/AppHeader'
import FloatingLogo from '@/components/FloatingLogo'
import { StepsContextProvider } from '@/contexts/steps'
import { WalletContextProvider } from '@/contexts/wallet'
import CreateWalletPage from '@/pages/NewWallet/CreateWalletPage'
import ImportWordsPage from '@/pages/NewWallet/ImportWordsPage'
import WalletWelcomePage from '@/pages/NewWallet/WalletWelcomePage'

const ImportWalletRoutes = () => {
  const importWalletSteps: JSX.Element[] = [
    <CreateWalletPage key="create-wallet" isRestoring />,
    <ImportWordsPage key="import-words" />,
    <WalletWelcomePage key="welcome" />
  ]

  return (
    <WalletContextProvider>
      <FloatingLogo />
      <StepsContextProvider stepElements={importWalletSteps} baseUrl="import" />
      <AppHeader />
    </WalletContextProvider>
  )
}

export default ImportWalletRoutes
