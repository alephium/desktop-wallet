import React, { useCallback, useEffect, useState } from 'react'
import styled, { ThemeProvider } from 'styled-components'
import { Redirect, Route, Switch, useHistory } from 'react-router-dom'
import HomePage from './pages/HomePage'
import CreateWalletPages from './pages/WalletManagement/CreateWalletRootPage'
import ImportWalletPages from './pages/WalletManagement/ImportWalletRootPage'
import { Wallet, getStorage } from 'alephium-js'
import { AnimatePresence, AnimateSharedLayout, motion } from 'framer-motion'
import WalletPages from './pages/Wallet/WalletRootPage'
import { AsyncReturnType } from 'type-fest'
import { createClient, loadSettingsOrDefault, saveSettings, Settings } from './utils/clients'
import SettingsPage from './pages/SettingsPage'
import { Modal } from './components/Modal'
import Spinner from './components/Spinner'
import { deviceBreakPoints, GlobalStyle } from './style/globalStyles'
import alephiumLogo from './images/alephium_logo.svg'
import { useInterval, useStateWithLocalStorage } from './utils/hooks'
import { lightTheme, darkTheme, ThemeType } from './style/themes'

interface Context {
  usernames: string[]
  currentUsername: string
  setCurrentUsername: (username: string) => void
  wallet?: Wallet
  setWallet: (w: Wallet | undefined) => void
  networkId: number
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
  networkId: 1,
  client: undefined,
  settings: loadSettingsOrDefault(),
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
  const [settings, setSettings] = useState<Settings>(loadSettingsOrDefault())
  const [clientIsLoading, setClientIsLoading] = useState(false)
  const [lastInteractionTime, setLastInteractionTime] = useState(new Date().getTime())
  const history = useHistory()
  const [theme, setTheme] = useStateWithLocalStorage<ThemeType>('theme', 'light')

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
          text: `Connected to Alephium's Node "${settings.nodeHost}"!`,
          type: 'info',
          duration: 4000
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
  const networkId = 1

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
          networkId,
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
                <HomePage hasWallet={hasWallet} usernames={usernames} networkId={networkId} />
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
