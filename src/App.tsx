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

import React, { useCallback, useEffect, useState } from 'react'
import styled, { ThemeProvider } from 'styled-components'
import { Redirect, Route, Switch, useHistory } from 'react-router-dom'
import { Wallet, getStorage } from 'alephium-js'
import { AnimatePresence, AnimateSharedLayout, motion } from 'framer-motion'
import { AsyncReturnType } from 'type-fest'

import HomePage from './pages/HomePage'
import CreateWalletPages from './pages/WalletManagement/CreateWalletRootPage'
import ImportWalletPages from './pages/WalletManagement/ImportWalletRootPage'
import WalletPages from './pages/Wallet/WalletRootPage'
import SettingsPage from './pages/SettingsPage'
import { createClient, loadSettings, saveSettings, Settings } from './utils/clients'
import { useInterval, useStateWithLocalStorage } from './utils/hooks'
import { Modal } from './components/Modal'
import Spinner from './components/Spinner'
import { deviceBreakPoints, GlobalStyle } from './style/globalStyles'
import { lightTheme, darkTheme, ThemeType } from './style/themes'
import alephiumLogo from './images/alephium_logo.svg'

interface Context {
  usernames: string[]
  currentUsername: string
  setCurrentUsername: (username: string) => void
  wallet?: Wallet
  setWallet: (w: Wallet | undefined) => void
  client: Client | undefined
  settings: Settings
  setSettings: React.Dispatch<React.SetStateAction<Settings>>
  setSnackbarMessage: (message: SnackbarMessage) => void
  switchTheme: (theme: ThemeType) => void
  currentTheme: ThemeType
}

type Client = AsyncReturnType<typeof createClient>

const initialContext: Context = {
  usernames: [],
  currentUsername: '',
  setCurrentUsername: () => null,
  wallet: undefined,
  setWallet: () => null,
  client: undefined,
  settings: loadSettings(),
  setSettings: () => null,
  setSnackbarMessage: () => null,
  switchTheme: () => null,
  currentTheme: 'light'
}

interface SnackbarMessage {
  text: string
  type: 'info' | 'alert' | 'success'
  duration?: number
}

export const GlobalContext = React.createContext<Context>(initialContext)

const Storage = getStorage()

const App = () => {
  const [splashScreenVisible, setSplashScreenVisible] = useState(true)
  const [wallet, setWallet] = useState<Wallet>()
  const [currentUsername, setCurrentUsername] = useState('')
  const [snackbarMessage, setSnackbarMessage] = useState<SnackbarMessage | undefined>()
  const [client, setClient] = useState<Client>()
  const [settings, setSettings] = useState<Settings>(loadSettings())
  const [clientIsLoading, setClientIsLoading] = useState(false)
  const [lastInteractionTime, setLastInteractionTime] = useState(new Date().getTime())
  const history = useHistory()
  const [theme, setTheme] = useStateWithLocalStorage<ThemeType>('theme', 'light')

  // Create client
  useEffect(() => {
    const getClient = async () => {
      setClientIsLoading(true)
      // Get clients
      const clientResp = await createClient(settings)
      setClient(clientResp)

      console.log('Clients initialized.')

      setSnackbarMessage({
        text: `Alephium's Node URL: "${settings.nodeHost}"`,
        type: 'info',
        duration: 4000
      })
      setClientIsLoading(false)

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

  // Auto-lock mechanism
  const lastInteractionTimeThrottle = 10000
  const autoLockThreshold = 3 * 60 * 1000 // TODO: Allow to set this parameter in app settings

  const updateLastInteractionTime = useCallback(() => {
    const currentTime = new Date().getTime()

    if (currentTime - lastInteractionTime > lastInteractionTimeThrottle) {
      setLastInteractionTime(currentTime)
    }
  }, [lastInteractionTime])

  useEffect(() => {
    document.addEventListener('mousemove', updateLastInteractionTime)
    document.addEventListener('keydown', updateLastInteractionTime)
    document.addEventListener('scroll', updateLastInteractionTime)

    return () => {
      document.removeEventListener('mousemove', updateLastInteractionTime)
      document.removeEventListener('keydown', updateLastInteractionTime)
      document.removeEventListener('scroll', updateLastInteractionTime)
    }
  }, [updateLastInteractionTime])

  useInterval(() => {
    const currentTime = new Date().getTime()

    if (currentTime - lastInteractionTime > autoLockThreshold && wallet) {
      setWallet(undefined)
    }
  }, 2000)

  const usernames = Storage.list()
  const hasWallet = usernames.length > 0

  return (
    <ThemeProvider theme={theme === 'light' ? lightTheme : darkTheme}>
      <GlobalStyle />

      <GlobalContext.Provider
        value={{
          usernames,
          currentUsername,
          setCurrentUsername,
          wallet,
          setWallet,
          client,
          setSnackbarMessage,
          settings,
          setSettings,
          switchTheme: setTheme as (arg0: ThemeType) => void,
          currentTheme: theme as ThemeType
        }}
      >
        <AppContainer>
          {splashScreenVisible && <SplashScreen onSplashScreenShown={() => setSplashScreenVisible(false)} />}
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
                <HomePage hasWallet={hasWallet} usernames={usernames} />
              </Route>
            </Switch>
          </AnimateSharedLayout>
          <AnimatePresence exitBeforeEnter initial={false}>
            <Switch>
              <Route path="/settings">
                <Modal
                  title="Settings"
                  onClose={() => history.push(history.location.pathname.replace('/settings', ''))}
                >
                  <SettingsPage />
                </Modal>
              </Route>
            </Switch>
          </AnimatePresence>
        </AppContainer>
        <ClientLoading>{clientIsLoading && <Spinner size="15px" />}</ClientLoading>
        <SnackbarManager message={snackbarMessage} />
      </GlobalContext.Provider>
    </ThemeProvider>
  )
}

const SplashScreen = ({ onSplashScreenShown }: { onSplashScreenShown: () => void }) => {
  return (
    <StyledSplashScreen
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ delay: 1 }}
      onAnimationComplete={onSplashScreenShown}
    >
      <AlephiumLogoContainer
        initial={{ opacity: 0, scale: 1.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
      >
        <AlephiumLogo />
      </AlephiumLogoContainer>
    </StyledSplashScreen>
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
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background-color: ${({ theme }) => theme.bg.secondary};

  @media ${deviceBreakPoints.mobile} {
    background-color: ${({ theme }) => theme.bg.primary};
    justify-content: initial;
  }

  @media ${deviceBreakPoints.short} {
    background-color: ${({ theme }) => theme.bg.primary};
  }
`

const SnackbarManagerContainer = styled.div`
  position: fixed;
  bottom: 0;
  right: 0;
  left: 0;
  display: flex;
  justify-content: flex-end;
  z-index: 10001;

  @media ${deviceBreakPoints.mobile} {
    justify-content: center;
  }
`

const SnackbarPopup = styled(motion.div)`
  margin: 15px;
  text-align: center;
  min-width: 200px;
  padding: 20px 15px;
  color: ${({ theme }) => (theme.name === 'light' ? theme.font.contrastPrimary : theme.font.primary)};
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 7px;
  z-index: 1000;
  box-shadow: 0 15px 15px rgba(0, 0, 0, 0.15);

  &.alert {
    background-color: ${({ theme }) => theme.global.alert};
  }

  &.info {
    background-color: ${({ theme }) => (theme.name === 'light' ? theme.bg.contrast : theme.bg.primary)};
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

const StyledSplashScreen = styled(motion.div)`
  position: fixed;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10002;
  background-color: ${({ theme }) => theme.bg.primary};
`

const AlephiumLogoContainer = styled(motion.div)`
  width: 150px;
  height: 150px;
  border-radius: 100%;
  display: flex;
  background-color: ${({ theme }) => (theme.name === 'light' ? theme.bg.contrast : theme.bg.secondary)};
`

const AlephiumLogo = styled.div`
  background-image: url(${alephiumLogo});
  background-repeat: no-repeat;
  background-position: center;
  width: 60%;
  height: 60%;
  margin: auto;
`

export default App
