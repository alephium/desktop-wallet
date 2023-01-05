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

import AppSpinner from './components/AppSpinner'
import { CenteredSection } from './components/PageComponents/PageContainers'
import SnackbarManager from './components/SnackbarManager'
import SplashScreen from './components/SplashScreen'
import Tooltip from './components/Tooltip'
import UpdateWalletBanner from './components/UpdateWalletBanner'
import { useGlobalContext } from './contexts/global'
import { useAppDispatch, useAppSelector } from './hooks/redux'
import UpdateWalletModal from './modals/UpdateWalletModal'
import Router from './routes'
import { languageChanged, languageChangeStarted } from './store/actions'
import { GlobalStyle } from './style/globalStyles'
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
      dispatch(languageChangeStarted())

      try {
        dayjs.locale(settings.general.language.slice(0, 2))
        await i18n.changeLanguage(settings.general.language)
      } catch (e) {
        console.error(e)
      } finally {
        dispatch(languageChanged())
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

      {splashScreenVisible && <SplashScreen onSplashScreenShown={() => setSplashScreenVisible(false)} />}

      <AppContainer>
        <CenteredSection>
          <Router />
        </CenteredSection>
        <BannerSection>{newLatestVersion && <UpdateWalletBanner newVersion={newLatestVersion} />}</BannerSection>
      </AppContainer>

      <SnackbarManager message={snackbarMessage} />

      <Tooltip place="right" />

      {isUpdateWalletModalVisible && (
        <UpdateWalletModal
          newVersion={newLatestVersion}
          startDownload={newVersionDownloadTriggered}
          onClose={() => setUpdateWalletModalVisible(false)}
        />
      )}

      {isAppLoading && <AppSpinner />}
    </ThemeProvider>
  )
}

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;

  background-color: ${({ theme }) => theme.bg.secondary};
`

const BannerSection = styled.div`
  flex-shrink: 0;
`

export default App
