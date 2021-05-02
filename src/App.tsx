import React, { useEffect, useState } from 'react'
import styled, { ThemeProvider } from 'styled-components'
import { BrowserRouter as Router, Redirect, Route, Switch } from 'react-router-dom'

import HomePage from './pages/HomePage'
import { GlobalStyle } from './style/globalStyles'
import { lightTheme } from './style/themes'
import CreateWalletPages from './pages/CreateWallet/CreateWalletRootPage'
import { Wallet } from 'alf-client'
import { AnimatePresence, AnimateSharedLayout, motion } from 'framer-motion'
import { Storage } from 'alf-client'
import { NetworkTypeString } from './types'
import WalletPages from './pages/Wallet/WalletRootPage'
import { AsyncReturnType } from 'type-fest'
import { createClient } from './utils/util'

interface Context {
  usernames: string[]
  wallet?: Wallet
  setWallet: (w: Wallet) => void
  networkType: NetworkTypeString
  client: Client | undefined
  setSnackbarMessage: (message: SnackbarMessage) => void
}

type Client = AsyncReturnType<typeof createClient>

const initialContext: Context = {
  usernames: [],
  wallet: undefined,
  setWallet: () => null,
  networkType: 'T',
  client: undefined,
  setSnackbarMessage: () => null
}

interface SnackbarMessage {
  text: string
  type: 'info' | 'alert'
}

export const GlobalContext = React.createContext<Context>(initialContext)

const App = () => {
  const [wallet, setWallet] = useState<Wallet>()

  const [snackbarMessage, setSnackbarMessage] = useState<SnackbarMessage | undefined>()
  const [client, setClient] = useState<Client>()

  // Create client
  useEffect(() => {
    const getClient = async () => {
      try {
        // Get clients
        const clientResp = await createClient()
        setClient(clientResp)

        console.log('Clients initialized.')
      } catch (e) {
        console.log(e)
        setSnackbarMessage({
          text: 'Unable to initialize the client, please check your network settings.',
          type: 'alert'
        })
      }
    }

    getClient()
  }, [setSnackbarMessage, wallet])

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
    <GlobalContext.Provider value={{ usernames, wallet, setWallet, networkType: 'T', client, setSnackbarMessage }}>
      <ThemeProvider theme={lightTheme}>
        <GlobalStyle />
        <Router>
          <AppContainer>
            <AnimateSharedLayout>
              <Switch>
                <Route exact path="/">
                  <HomePage hasWallet={hasWallet} usernames={usernames} networkType={networkType} />
                </Route>
                <Route exact path="/create/:step?">
                  <CreateWalletPages />
                  <Redirect exact from="/create/" to="/create/0" />
                </Route>
                <Route path="/wallet">
                  <WalletPages />
                </Route>
              </Switch>
            </AnimateSharedLayout>
          </AppContainer>
        </Router>
        <SnackbarManager message={snackbarMessage} />
      </ThemeProvider>
    </GlobalContext.Provider>
  )
}

const SnackbarManager = ({ message }: { message: SnackbarMessage | undefined }) => {
  return (
    <AnimatePresence>
      {message && (
        <SnackbarPopup initial={{ y: 80 }} animate={{ y: 0 }} exit={{ y: 80 }} className={message?.type}>
          {message?.text}
        </SnackbarPopup>
      )}
    </AnimatePresence>
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
  overflow-y: auto;
`

const SnackbarPopup = styled(motion.div)`
  position: absolute;
  bottom: 10px;
  right: 10px;
  left: 10px;
  padding: 20px 15px;
  color: ${({ theme }) => theme.font.contrast};
  border-radius: 14px;

  &.alert {
    background-color: ${({ theme }) => theme.global.alert};
  }

  &.info {
    background-color: ${({ theme }) => theme.font.primary};
  }
`

export default App
