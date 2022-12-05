/*
Copyright 2018 - 2022 The Alephium Authors
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

import 'dayjs/locale/fr'

import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import ReactTooltip from 'react-tooltip'
import styled, { ThemeProvider } from 'styled-components'

import SnackbarManager from './components/SnackbarManager'
import Spinner from './components/Spinner'
import SplashScreen from './components/SplashScreen'
import Tooltip from './components/Tooltip'
import { useGlobalContext } from './contexts/global'
import { useAppDispatch, useAppSelector } from './hooks/redux'
import UpdateWalletModal from './modals/UpdateWalletModal'
import Router from './routes'
import { appLoadingToggled } from './store/appSlice'
import { deviceBreakPoints, GlobalStyle } from './style/globalStyles'
import { darkTheme, lightTheme } from './style/themes'

const App = () => {
  const { networkStatus, settings, snackbarMessage, newLatestVersion, newVersionDownloadTriggered } = useGlobalContext()
  const { i18n } = useTranslation()
  const [isAppLoading, isAuthenticated] = useAppSelector((s) => [s.app.loading, !!s.activeWallet.mnemonic])
  const dispatch = useAppDispatch()

  const [splashScreenVisible, setSplashScreenVisible] = useState(true)
  const [isUpdateWalletModalVisible, setUpdateWalletModalVisible] = useState(!!newLatestVersion)

  useEffect(() => {
    if (networkStatus === 'offline' || isAuthenticated) ReactTooltip.rebuild()
  }, [isAuthenticated, networkStatus])

  useEffect(() => {
    const handleLanguageChange = async () => {
      dispatch(appLoadingToggled(true))

      try {
        dayjs.locale(settings.general.language.slice(0, 2))
        await i18n.changeLanguage(settings.general.language)
      } catch (e) {
        console.error(e)
      } finally {
        dispatch(appLoadingToggled(false))
      }
    }

    if (i18n.language !== settings.general.language) {
      handleLanguageChange()
    }
  }, [dispatch, i18n, settings.general.language])

  useEffect(() => {
    if (newLatestVersion) setUpdateWalletModalVisible(true)
  }, [newLatestVersion])

  useEffect(() => {
    if (newVersionDownloadTriggered) setUpdateWalletModalVisible(true)
  }, [newVersionDownloadTriggered])

  return (
    <ThemeProvider theme={settings.general.theme === 'light' ? lightTheme : darkTheme}>
      <GlobalStyle />
      <AppContainer>
        {splashScreenVisible && <SplashScreen onSplashScreenShown={() => setSplashScreenVisible(false)} />}
        <Router />
      </AppContainer>
      {isAppLoading && (
        <ClientLoading>
          <Spinner size="60px" />
        </ClientLoading>
      )}
      <SnackbarManager message={snackbarMessage} />
      <Tooltip />
      {isUpdateWalletModalVisible && (
        <UpdateWalletModal
          newVersion={newLatestVersion}
          startDownload={newVersionDownloadTriggered}
          onClose={() => setUpdateWalletModalVisible(false)}
        />
      )}
    </ThemeProvider>
  )
}

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
`

const ClientLoading = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  color: var(--color-black);
  background-color: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(3px);
  z-index: 1002;
`

export default App
