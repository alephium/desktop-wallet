import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { Redirect, Route, Switch, useHistory } from 'react-router-dom'
import HomePage from './pages/HomePage'
import CreateWalletPages from './pages/WalletManagement/CreateWalletRootPage'
import ImportWalletPages from './pages/WalletManagement/ImportWalletRootPage'
import { NetworkId, Wallet, getStorage } from 'alf-client'
import { AnimatePresence, AnimateSharedLayout, motion } from 'framer-motion'
import WalletPages from './pages/Wallet/WalletRootPage'
import { AsyncReturnType } from 'type-fest'
import { createClient, loadSettingsOrDefault, saveSettings, Settings } from './utils/clients'
import SettingsPage from './pages/SettingsPage'
import { Modal } from './components/Modal'
import Spinner from './components/Spinner'

interface Context {
  usernames: string[]
  currentUsername: string
  setCurrentUsername: (username: string) => void
  wallet?: Wallet
  setWallet: (w: Wallet | undefined) => void
  networkId: NetworkId
  client: Client | undefined
  settings: Settings
  setSettings: React.Dispatch<React.SetStateAction<Settings>>
  setSnackbarMessage: (message: SnackbarMessage) => void
}

type Client = AsyncReturnType<typeof createClient>

const initialContext: Context = {
  usernames: [],
  currentUsername: '',
  setCurrentUsername: () => null,
  wallet: undefined,
  setWallet: () => null,
  networkId: 1,
  client: undefined,
  settings: loadSettingsOrDefault(),
  setSettings: () => null,
  setSnackbarMessage: () => null
}

interface SnackbarMessage {
  text: string
  type: 'info' | 'alert' | 'success'
  duration?: number
}

export const GlobalContext = React.createContext<Context>(initialContext)

const Storage = getStorage()

const App = () => {
  const [wallet, setWallet] = useState<Wallet>()
  const [currentUsername, setCurrentUsername] = useState('')
  const [snackbarMessage, setSnackbarMessage] = useState<SnackbarMessage | undefined>()
  const [client, setClient] = useState<Client>()
  const [settings, setSettings] = useState<Settings>(loadSettingsOrDefault())
  const [clientIsLoading, setClientIsLoading] = useState(false)
  const history = useHistory()

  // Create client
  useEffect(() => {
    const getClient = async () => {
      try {
        setClientIsLoading(true)
        // Get clients
        const clientResp = await createClient(settings)
        setClient(clientResp)

        console.log('Clients initialized.')

        setSnackbarMessage({
          text: `Connected to Alephium's Node "${settings.host}"!`,
          type: 'info',
          duration: 2000
        })
        setClientIsLoading(false)
      } catch (e) {
        setSnackbarMessage({
          text: 'Unable to initialize the client, please check your network settings.',
          type: 'alert'
        })
        setClientIsLoading(false)
      }

      // Save settings
      saveSettings(settings)
    }

    getClient()
  }, [setSnackbarMessage, settings])

  // Remove snackbar popup
  useEffect(() => {
    if (snackbarMessage) {
      setTimeout(() => setSnackbarMessage(undefined), snackbarMessage.duration || 3000)
    }
  }, [snackbarMessage])

  const usernames = Storage.list()
  const hasWallet = usernames.length > 0
  const networkId: NetworkId = 1

  return (
    <GlobalContext.Provider
      value={{
        usernames,
        currentUsername,
        setCurrentUsername,
        wallet,
        setWallet,
        networkId,
        client,
        setSnackbarMessage,
        settings,
        setSettings
      }}
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
            <Route path="">
              <HomePage hasWallet={hasWallet} usernames={usernames} networkId={networkId} />
            </Route>
          </Switch>
        </AnimateSharedLayout>
        <Route path="/settings">
          <Modal title="Settings" onClose={() => history.push(history.location.pathname.replace('/settings', ''))}>
            <SettingsPage />
          </Modal>
        </Route>
      </AppContainer>
      <ClientLoading>{clientIsLoading && <Spinner size="15px" />}</ClientLoading>
      <SnackbarManager message={snackbarMessage} />
    </GlobalContext.Provider>
  )
}

const SnackbarManager = ({ message }: { message: SnackbarMessage | undefined }) => {
  return (
    <SnackbarManagerContainer>
      <AnimatePresence>
        {message && (
          <SnackbarPopup
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ opacity: 0 }}
            className={message?.type}
          >
            {message?.text}
          </SnackbarPopup>
        )}
      </AnimatePresence>
    </SnackbarManagerContainer>
  )
}

// === Styling === //

const AppContainer = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
`

const SnackbarManagerContainer = styled.div`
  position: fixed;
  bottom: 0;
  right: 0;
  left: 0;
  display: flex;
  z-index: 10001;
`

const SnackbarPopup = styled(motion.div)`
  bottom: 10px;
  margin: 10px auto;
  text-align: center;
  min-width: 300px;
  width: 50vw;
  padding: 20px 15px;
  color: ${({ theme }) => theme.font.contrastPrimary};
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

const ClientLoading = styled.div`
  position: absolute;
  top: 15px;
  left: 25px;
  transform: translateX(-50%);
  color: white;
`

export default App
