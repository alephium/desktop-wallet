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

import { AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import styled, { ThemeProvider } from 'styled-components'

import { CenteredSection } from './components/PageComponents/PageContainers'
import SnackbarManager from './components/SnackbarManager'
import SplashScreen from './components/SplashScreen'
import UpdateWalletBanner from './components/UpdateWalletBanner'
import { useGlobalContext } from './contexts/global'
import { useAppDispatch, useAppSelector } from './hooks/redux'
import UpdateWalletModal from './modals/UpdateWalletModal'
import Router from './routes'
import { networkSettingsMigrated } from './store/networkSlice'
import { generalSettingsMigrated } from './store/settingsSlice'
import { GlobalStyle } from './style/globalStyles'
import { darkTheme, lightTheme } from './style/themes'
import { migrateDeprecatedSettings, migrateWalletData } from './utils/migration'

const App = () => {
  const dispatch = useAppDispatch()
  const settings = useAppSelector((state) => state.settings)
  const { snackbarMessage, newVersion, newVersionDownloadTriggered } = useGlobalContext()

  const [splashScreenVisible, setSplashScreenVisible] = useState(true)
  const [isUpdateWalletModalVisible, setUpdateWalletModalVisible] = useState(!!newVersion)

  useEffect(() => {
    const localStorageSettings = migrateDeprecatedSettings()

    dispatch(generalSettingsMigrated(localStorageSettings.general))
    dispatch(networkSettingsMigrated(localStorageSettings.network))

    migrateWalletData()
  }, [dispatch])

  useEffect(() => {
    if (newVersion) setUpdateWalletModalVisible(true)
  }, [newVersion])

  useEffect(() => {
    if (newVersionDownloadTriggered) setUpdateWalletModalVisible(true)
  }, [newVersionDownloadTriggered])

  return (
    <ThemeProvider theme={settings.theme === 'light' ? lightTheme : darkTheme}>
      <GlobalStyle />

      {splashScreenVisible && <SplashScreen onSplashScreenShown={() => setSplashScreenVisible(false)} />}

      <AppContainer>
        <CenteredSection>
          <Router />
        </CenteredSection>
        <BannerSection>{newVersion && <UpdateWalletBanner />}</BannerSection>
      </AppContainer>

      <SnackbarManager message={snackbarMessage} />
      <AnimatePresence>
        {isUpdateWalletModalVisible && <UpdateWalletModal onClose={() => setUpdateWalletModalVisible(false)} />}
      </AnimatePresence>
    </ThemeProvider>
  )
}

export default App

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;

  background-color: ${({ theme }) => theme.bg.secondary};
`

const BannerSection = styled.div`
  flex-shrink: 0;
`
