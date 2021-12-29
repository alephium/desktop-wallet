/*
Copyright 2018 - 2021 The Alephium Authors
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

import { Transaction } from 'alephium-js/dist/api/api-explorer'
import { AnimatePresence } from 'framer-motion'
import React, { useEffect, useState } from 'react'
import { Route, Switch, useHistory, useLocation } from 'react-router-dom'

import Modal from '../../components/Modal'
import { useGlobalContext } from '../../contexts/global'
import { NetworkType } from '../../utils/settings'
import SettingsPage from '../Settings/SettingsPage'
import AddressPage from './AddressPage'
import SendPage from './SendPage'
import WalletHomePage from './WalletHomePage'

export interface SimpleTx {
  txId: string
  toAddress: string
  amount: string
  timestamp: number
}

interface WalletContextType {
  networkPendingTxLists: { [key in NetworkType]?: SimpleTx[] }
  addPendingTx: (tx: SimpleTx) => void
  loadedTxList: Transaction[]
  setLoadedTxList: (list: Transaction[]) => void
}

const initialContext: WalletContextType = {
  networkPendingTxLists: {},
  addPendingTx: () => null,
  loadedTxList: [],
  setLoadedTxList: () => null
}

export const WalletContext = React.createContext<WalletContextType>(initialContext)

const Wallet = () => {
  const { wallet, currentNetwork } = useGlobalContext()
  const history = useHistory()
  const location = useLocation()

  const [loadedTxList, setLoadedTxList] = useState<WalletContextType['loadedTxList']>([])
  const [networkPendingTxLists, setNetworkPendingTxLists] = useState<WalletContextType['networkPendingTxLists']>({})

  const addPendingTx = (tx: SimpleTx) => {
    tx && setNetworkPendingTxLists((prev) => ({ ...prev, [currentNetwork]: [...(prev[currentNetwork] || []), tx] }))
  }

  // Redirect if wallet is not set
  useEffect(() => {
    if (!wallet) {
      history.push('/')
    }
  }, [history, wallet])

  // Manage state of pending tx (clean if in loaded list)
  useEffect(() => {
    setNetworkPendingTxLists((prev) => ({
      ...prev,
      [currentNetwork]: prev?.[currentNetwork]?.filter((t) => !loadedTxList.find((tx) => tx.hash === t.txId)) || []
    }))
  }, [currentNetwork, loadedTxList])

  return (
    <WalletContext.Provider value={{ addPendingTx, setLoadedTxList, networkPendingTxLists, loadedTxList }}>
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
