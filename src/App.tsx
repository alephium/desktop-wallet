import React, { useState } from 'react'
import styled, { ThemeProvider } from 'styled-components'
import { BrowserRouter as Router, Route } from 'react-router-dom'

import Home from './pages/Home'
import { GlobalStyle } from './style/globalStyles'
import { lightTheme } from './style/themes'
import CreateWallet from './pages/CreateWallet'
import { Wallet } from 'alf-client/lib/wallet'
import { AnimateSharedLayout } from 'framer-motion'

const App = () => {
  const [wallet, setWallet] = useState<Wallet>()
  const hasWallet = wallet !== undefined

  return (
    <ThemeProvider theme={lightTheme}>
      <GlobalStyle />
      <AppContainer>
        <AnimateSharedLayout>
          <Router>
            <Route exact path="/">
              <Home hasWallet={hasWallet} />
            </Route>
            <Route exact path="/create">
              <CreateWallet setWallet={setWallet} />
            </Route>
          </Router>
        </AnimateSharedLayout>
      </AppContainer>
    </ThemeProvider>
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
