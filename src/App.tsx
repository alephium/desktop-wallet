import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { Redirect, Route, Switch, useHistory } from 'react-router-dom'
import HomePage from './pages/HomePage'
import CreateWalletPages from './pages/WalletManagement/CreateWalletRootPage'
import ImportWalletPages from './pages/WalletManagement/ImportWalletRootPage'
import { Wallet } from 'alf-client'
import { AnimatePresence, AnimateSharedLayout, motion } from 'framer-motion'
import { Storage } from 'alf-client'
import { NetworkTypeString } from './types'
import WalletPages from './pages/Wallet/WalletRootPage'
import { AsyncReturnType } from 'type-fest'
import { createClient, loadSettingsOrDefault, saveSettings, Settings } from './utils/clients'
import SettingsPage from './pages/SettingsPage'
import { Modal } from './components/Modal'

interface Context {
  usernames: string[]
  wallet?: Wallet
  setWallet: (w: Wallet) => void
  networkType: NetworkTypeString
  client: Client | undefined
  settings: Settings
  setSettings: React.Dispatch<React.SetStateAction<Settings>>
  setSnackbarMessage: (message: SnackbarMessage) => void
}

type Client = AsyncReturnType<typeof createClient>

const initialContext: Context = {
  usernames: [],
  wallet: undefined,
  setWallet: () => null,
  networkType: 'T',
  client: undefined,
  settings: loadSettingsOrDefault(),
  setSettings: () => null,
  setSnackbarMessage: () => null
}

interface SnackbarMessage {
  text: string
  type: 'info' | 'alert' | 'success'
}

export const GlobalContext = React.createContext<Context>(initialContext)

const App = () => {
  const [wallet, setWallet] = useState<Wallet>()

  const [snackbarMessage, setSnackbarMessage] = useState<SnackbarMessage | undefined>()
  const [client, setClient] = useState<Client>()
  const [settings, setSettings] = useState<Settings>(loadSettingsOrDefault())
  const history = useHistory()

  // Create client
  useEffect(() => {
    const getClient = async () => {
      try {
        // Get clients
        const clientResp = await createClient(settings)
        setClient(clientResp)

        console.log('Clients initialized.')

        setSnackbarMessage({
          text: `Connected to Alephium's Node "${settings.host}"!`,
          type: 'info'
        })
      } catch (e) {
        console.log(e)
        setSnackbarMessage({
          text: 'Unable to initialize the client, please check your network settings.',
          type: 'alert'
        })
      }

      // Save settings
      saveSettings(settings)
    }

    getClient()
  }, [setSnackbarMessage, settings])

  // Remove snackbar popup
  useEffect(() => {
    if (snackbarMessage) {
      setTimeout(() => setSnackbarMessage(undefined), 3000)
    }
  }, [snackbarMessage])

  const usernames = Storage().list()
  const hasWallet = usernames.length > 0
  const networkType: NetworkTypeString = 'T'

  return (
    <GlobalContext.Provider
      value={{ usernames, wallet, setWallet, networkType: 'T', client, setSnackbarMessage, settings, setSettings }}
    >
      <AppContainer>
        <AnimateSharedLayout type="crossfade">
          <Switch>
            <Route exact path="/create/:step?">
              <CreateWalletPages />
              <Redirect exact from="/create/" to="/create/0" />
            </Route>
            <Route exact path="/import/:step?">
              <ImportWalletPages />
              <Redirect exact from="/import/" to="/import/0" />
            </Route>
            <Route path="/wallet">
              <WalletPages />
            </Route>
            <Route path="/">
              <HomePage hasWallet={hasWallet} usernames={usernames} networkType={networkType} />
            </Route>
          </Switch>
          <Route path="/settings">
            <Modal title="Settings" onClose={() => history.push(history.location.pathname.replace('/settings', ''))}>
              <SettingsPage />
            </Modal>
          </Route>
        </AnimateSharedLayout>
      </AppContainer>
      <SnackbarManager message={snackbarMessage} />
    </GlobalContext.Provider>
  )
}

const SnackbarManager = ({ message }: { message: SnackbarMessage | undefined }) => {
  return (
    <SnackbarManagerContainer>
      <AnimatePresence>
        {message && (
          <SnackbarPopup initial={{ y: 80 }} animate={{ y: 0 }} exit={{ y: 80 }} className={message?.type}>
            {message?.text}
          </SnackbarPopup>
        )}
      </AnimatePresence>
    </SnackbarManagerContainer>
  )
}

// === Styling === //

const AppContainer = styled.main`
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  display: flex;
`

const SnackbarManagerContainer = styled.div`
  position: fixed;
  bottom: 0;
  right: 0;
  left: 0;
  display: flex;
`

const SnackbarPopup = styled(motion.div)`
  bottom: 10px;
  margin: 10px auto;
  text-align: center;
  min-width: 300px;
  width: 50vw;
  padding: 20px 15px;
  color: ${({ theme }) => theme.font.contrast};
  border-radius: 14px;
  z-index: 1000;
  box-shadow: 0 15px 15px rgba(0, 0, 0, 0.15);

  &.alert {
    background-color: ${({ theme }) => theme.global.alert};
  }

  &.info {
    background-color: ${({ theme }) => theme.font.primary};
  }

  &.success {
    background-color: ${({ theme }) => theme.global.valid};
  }
`

export default App
