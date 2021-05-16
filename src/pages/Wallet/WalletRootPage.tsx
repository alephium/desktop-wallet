import React, { useContext, useEffect, useState } from 'react'
import { MainContainer } from '../../components/PageComponents'
import Modal from '../../components/Modal'
import { GlobalContext } from '../../App'
import { Route, useHistory, Switch, useLocation } from 'react-router-dom'
import WalletHomePage from './WalletHomePage'
import SendPage from './SendPage'
import { AnimatePresence } from 'framer-motion'
import AddressPage from './AddressPage'
import { Transaction } from 'alf-client/dist/api/api-explorer'
import SettingsPage from '../../pages/SettingsPage'

export interface SimpleTx {
  txId: string
  toAddress: string
  amount: string
  timestamp: number
}

interface WalletContext {
  pendingTxList: SimpleTx[]
  addPendingTx: (tx: SimpleTx) => void
  loadedTxList: Transaction[]
  setLoadedTxList: (list: Transaction[]) => void
}

const initialContext: WalletContext = {
  pendingTxList: [],
  addPendingTx: () => null,
  loadedTxList: [],
  setLoadedTxList: () => null
}

export const WalletContext = React.createContext<WalletContext>(initialContext)

const Wallet = () => {
  const { wallet } = useContext(GlobalContext)
  const history = useHistory()
  const location = useLocation()

  const [loadedTxList, setLoadedTxList] = useState<Transaction[]>([])
  const [pendingTxList, setPendingTxList] = useState<SimpleTx[]>([])

  const addPendingTx = (tx: SimpleTx) => {
    setPendingTxList((prev) => {
      if (prev && tx) {
        return [...prev, tx]
      } else return prev
    })
  }

  // Redirect if not wallet is set
  useEffect(() => {
    if (!wallet) {
      history.push('/')
    }
  }, [history, wallet])

  // Manage state of pending tx (clean if in loaded list)
  useEffect(() => {
    setPendingTxList((prev) => prev.filter((t) => !loadedTxList.find((tx) => tx.hash === t.txId)))
  }, [loadedTxList])

  return (
    <WalletContext.Provider value={{ addPendingTx, setLoadedTxList, pendingTxList, loadedTxList }}>
      <MainContainer>
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
      </MainContainer>
    </WalletContext.Provider>
  )
}

export default Wallet
