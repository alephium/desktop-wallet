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

import { getStorage } from 'alephium-js'
import { AnimatePresence, AnimateSharedLayout } from 'framer-motion'
import { Redirect, Route, Switch, useHistory } from 'react-router-dom'

import ModalCentered from '../components/ModalCentered'
import HomePage from '../pages/HomePage'
import SettingsPage from '../pages/Settings/SettingsPage'
import CreateWalletRoutes from './CreateWalletRoutes'
import ImportWalletRoutes from './ImportWalletRoutes'
import WalletRoutes from './WalletRoutes'

const Storage = getStorage()

const Routes = () => {
  const history = useHistory()

  const usernames = Storage.list()
  const hasWallet = usernames.length > 0

  return (
    <>
      <AnimateSharedLayout type="crossfade">
        <Switch>
          <Route exact path="/create/:step?">
            <CreateWalletRoutes />
            <Redirect exact from="/create/" to="/create/0" />
          </Route>
          <Route exact path="/import/:step?">
            <ImportWalletRoutes />
            <Redirect exact from="/import/" to="/import/0" />
          </Route>
          <Route path="/wallet">
            <WalletRoutes />
          </Route>
          <Route path="">
            <HomePage hasWallet={hasWallet} usernames={usernames} />
          </Route>
        </Switch>
      </AnimateSharedLayout>
      <AnimatePresence exitBeforeEnter initial={false}>
        <Switch>
          <Route path="/settings">
            <ModalCentered
              title="Settings"
              onClose={() => history.push(history.location.pathname.replace('/settings', ''))}
            >
              <SettingsPage />
            </ModalCentered>
          </Route>
        </Switch>
      </AnimatePresence>
    </>
  )
}

export default Routes
