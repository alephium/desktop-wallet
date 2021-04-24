import React, { useEffect, useState } from 'react'
import styled, { ThemeProvider } from 'styled-components'
import { BrowserRouter as Router, Redirect, Route } from 'react-router-dom'

import HomePage from './pages/HomePage'
import { GlobalStyle } from './style/globalStyles'
import { lightTheme } from './style/themes'
import CreateWalletPages from './pages/CreateWallet/CreateWalletRootPage'
import { Wallet } from 'alf-client'
import { AnimatePresence, AnimateSharedLayout, motion } from 'framer-motion'
import { Storage } from 'alf-client'
import { NetworkTypeString } from './types'
import WalletPage from './pages/Wallet/WalletRootPage'

interface Context {
  usernames: string[]
  wallet?: Wallet
  setWallet: (w: Wallet) => void
  networkType: NetworkTypeString
  setSnackbarMessage: (message: SnackbarMessage) => void
}

const initialContext: Context = {
  usernames: [],
  wallet: undefined,
  setWallet: () => null,
  networkType: 'T',
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
    <GlobalContext.Provider value={{ usernames, wallet, setWallet, networkType: 'T', setSnackbarMessage }}>
      <ThemeProvider theme={lightTheme}>
        <GlobalStyle />
        <AppContainer>
          <AnimateSharedLayout>
            <Router>
              <Route exact path="/">
                <HomePage hasWallet={hasWallet} usernames={usernames} networkType={networkType} />
              </Route>
              <Route exact path="/create/:step?">
                <CreateWalletPages />
                <Redirect exact from="/create/" to="/create/0" />
              </Route>
              <Route path="/wallet">
                <WalletPage />
              </Route>
            </Router>
          </AnimateSharedLayout>
        </AppContainer>
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
