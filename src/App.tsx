import React, { useState } from 'react'
import styled, { ThemeProvider } from 'styled-components'
import { BrowserRouter as Router, Redirect, Route } from 'react-router-dom'

import Home from './pages/Home'
import { GlobalStyle } from './style/globalStyles'
import { lightTheme } from './style/themes'
import CreateWallet from './pages/CreateWallet/index'
import { Wallet } from 'alf-client'
import { AnimateSharedLayout } from 'framer-motion'
import { Storage } from 'alf-client'

interface Context {
  usernames: string[]
  wallet?: Wallet
  setWallet: (w: Wallet) => void
  networkType: 'T' | 'M' | 'D'
}

const initialContext: Context = {
  usernames: [],
  wallet: undefined,
  setWallet: () => null,
  networkType: 'T'
}

export const GlobalContext = React.createContext<Context>(initialContext)

const App = () => {
  const [wallet, setWallet] = useState<Wallet>()

  const usernames = Storage().list()
  const hasWallet = usernames.length > 0

  return (
    <GlobalContext.Provider value={{ usernames, wallet, setWallet, networkType: 'T' }}>
      <ThemeProvider theme={lightTheme}>
        <GlobalStyle />
        <AppContainer>
          <AnimateSharedLayout>
            <Router>
              <Route exact path="/">
                <Home hasWallet={hasWallet} usernames={usernames} />
              </Route>
              <Route exact path="/create/:step?">
                <CreateWallet />
                <Redirect exact from="/create/" to="/create/0" />
              </Route>
            </Router>
          </AnimateSharedLayout>
        </AppContainer>
      </ThemeProvider>
    </GlobalContext.Provider>
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

export default App
