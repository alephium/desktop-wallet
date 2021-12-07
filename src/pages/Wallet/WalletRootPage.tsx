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

import React, { useContext, useEffect, useState } from 'react'
import Modal from '../../components/Modal'
import { GlobalContext } from '../../App'
import { Route, useHistory, Switch, useLocation } from 'react-router-dom'
import WalletHomePage from './WalletHomePage'
import SendPage from './SendPage'
import { AnimatePresence } from 'framer-motion'
import AddressPage from './AddressPage'
import { Transaction } from 'alephium-js/dist/api/api-explorer'
import SettingsPage from '../../pages/SettingsPage'
import { NetworkType, useCurrentNetwork } from '../../utils/clients'

export interface SimpleTx {
  txId: string
  toAddress: string
  amount: string
  timestamp: number
}

interface WalletContextType {
  pendingTxList: { [key in NetworkType]?: SimpleTx[] }
  addPendingTx: (tx: SimpleTx) => void
  loadedTxList: Transaction[]
  setLoadedTxList: (list: Transaction[]) => void
}

const initialContext: WalletContextType = {
  pendingTxList: {},
  addPendingTx: () => null,
  loadedTxList: [],
  setLoadedTxList: () => null
}

export const WalletContext = React.createContext<WalletContextType>(initialContext)

const Wallet = () => {
  const { wallet } = useContext(GlobalContext)
  const currentNetwork = useCurrentNetwork()
  const history = useHistory()
  const location = useLocation()

  const [loadedTxList, setLoadedTxList] = useState<WalletContextType['loadedTxList']>([])
  const [pendingTxList, setPendingTxList] = useState<WalletContextType['pendingTxList']>({})

  const addPendingTx = (tx: SimpleTx) => {
    tx && setPendingTxList((prev) => ({ ...prev, [currentNetwork]: [...(prev[currentNetwork] || []), tx] }))
  }

  // Redirect if not wallet is set
  useEffect(() => {
    if (!wallet) {
      history.push('/')
    }
  }, [history, wallet])

  // Manage state of pending tx (clean if in loaded list)
  useEffect(() => {
    setPendingTxList((prev) => ({
      ...prev,
      [currentNetwork]: prev?.[currentNetwork]?.filter((t) => !loadedTxList.find((tx) => tx.hash === t.txId)) || []
    }))
  }, [currentNetwork, loadedTxList])

  return (
    <WalletContext.Provider value={{ addPendingTx, setLoadedTxList, pendingTxList, loadedTxList }}>
      <Route path="/wallet">
        <WalletHomePage />
      </Route>
      <AnimatePresence exitBeforeEnter initial={false}>
        <Switch location={location} key={location.pathname}>
          <Route path="/wallet/send" key="send">
            <Modal title="Send" onClose={() => history.push('/wallet')}>
              <SendPage />
            </Modal>
          </Route>
          <Route path="/wallet/address" key="address">
            <Modal title="Your address" onClose={() => history.push('/wallet')}>
              <AddressPage />
            </Modal>
          </Route>
          <Route path="/wallet/settings">
            <Modal title="Settings" onClose={() => history.push(history.location.pathname.replace('/settings', ''))}>
              <SettingsPage />
            </Modal>
          </Route>
        </Switch>
      </AnimatePresence>
    </WalletContext.Provider>
  )
}

export default Wallet
