/*
Copyright 2018 - 2023 The Alephium Authors
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

import { Route, Routes } from 'react-router-dom'

import HomePage from '@/pages/HomePage'
import CheckWordsIntroPage from '@/pages/NewWallet/CheckWordsIntroPage'
import CheckWordsPage from '@/pages/NewWallet/CheckWordsPage'
import CreateWalletPage from '@/pages/NewWallet/CreateWalletPage'
import ImportWordsPage from '@/pages/NewWallet/ImportWordsPage'
import NewWalletLayout from '@/pages/NewWallet/NewWalletLayout'
import WalletWelcomePage from '@/pages/NewWallet/WalletWelcomePage'
import WalletWordsPage from '@/pages/NewWallet/WalletWordsPage'
import UnlockedWalletRoutes from '@/routes/UnlockedWalletRoutes'

const createWalletSteps = [
  <CreateWalletPage key="create-wallet" />,
  <WalletWordsPage key="wallet-words" />,
  <CheckWordsIntroPage key="check-words-intro" />,
  <CheckWordsPage key="check-words" />,
  <WalletWelcomePage key="welcome" />
]
const importWalletSteps = [
  <CreateWalletPage key="create-wallet" isRestoring />,
  <ImportWordsPage key="import-words" />,
  <WalletWelcomePage key="welcome" />
]

const Router = () => (
  <Routes>
    <Route path="/create/:step" element={<NewWalletLayout baseUrl="create" steps={createWalletSteps} />} />
    <Route path="/import/:step" element={<NewWalletLayout baseUrl="import" steps={importWalletSteps} />} />
    <Route path="/wallet/*" element={<UnlockedWalletRoutes />} />
    <Route path="" element={<HomePage />} />
  </Routes>
)

export default Router
