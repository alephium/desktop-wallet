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
import { useCallback, useEffect, useState } from 'react'
import styled, { css, ThemeProvider } from 'styled-components'

import client from '@/api/client'
import AppSpinner from '@/components/AppSpinner'
import { CenteredSection } from '@/components/PageComponents/PageContainers'
import SnackbarManager from '@/components/SnackbarManager'
import SplashScreen from '@/components/SplashScreen'
import UpdateWalletBanner from '@/components/UpdateWalletBanner'
import { useGlobalContext } from '@/contexts/global'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import UpdateWalletModal from '@/modals/UpdateWalletModal'
import Router from '@/routes'
import {
  localStorageDataMigrated,
  systemLanguageMatchFailed,
  systemLanguageMatchSucceeded
} from '@/storage/app-state/actions'
import { selectAllAddresses, syncAddressesData } from '@/storage/app-state/slices/addressesSlice'
import { devModeShortcutDetected } from '@/storage/app-state/slices/appSlice'
import { syncNetworkTokensInfo } from '@/storage/app-state/slices/assetsInfoSlice'
import { apiClientInitFailed, apiClientInitSucceeded } from '@/storage/app-state/slices/networkSlice'
import { selectAddressesPendingTransactions } from '@/storage/app-state/slices/pendingTransactionsSlice'
import { GlobalStyle } from '@/style/globalStyles'
import { darkTheme, lightTheme } from '@/style/themes'
import { AlephiumWindow } from '@/types/window'
import { useInterval } from '@/utils/hooks'
import { migrateGeneralSettings, migrateNetworkSettings, migrateWalletData } from '@/utils/migration'
import { getAvailableLanguageOptions } from '@/utils/settings'

const App = () => {
  const { newVersion, newVersionDownloadTriggered } = useGlobalContext()
  const dispatch = useAppDispatch()
  const addresses = useAppSelector(selectAllAddresses)
  const addressHashes = addresses.map((address) => address.hash)
  const pendingTxHashes = useAppSelector((s) => selectAddressesPendingTransactions(s, addressHashes)).map(
    (tx) => tx.address.hash
  )
  const [network, addressesStatus, theme, assetsInfo, loading] = useAppSelector((s) => [
    s.network,
    s.addresses.status,
    s.app.theme,
    s.assetsInfo,
    s.app.loading
  ])
  const language = useAppSelector((s) => s.settings.language)
  const showDevIndication = useDevModeShortcut()

  const [splashScreenVisible, setSplashScreenVisible] = useState(true)
  const [isUpdateWalletModalVisible, setUpdateWalletModalVisible] = useState(!!newVersion)

  useEffect(() => {
    migrateGeneralSettings()
    migrateNetworkSettings()
    migrateWalletData()

    dispatch(localStorageDataMigrated())
  }, [dispatch])

  const setSystemLanguage = useCallback(async () => {
    const _window = window as unknown as AlephiumWindow
    const electron = _window.electron
    const systemLanguage = await electron?.app.getSystemLanguage()

    if (!systemLanguage) {
      dispatch(systemLanguageMatchFailed())
      return
    }

    const availableLanguageOptions = getAvailableLanguageOptions()
    const systemLanguageCode = systemLanguage.substring(0, 2)
    const matchedLanguage = availableLanguageOptions.find((lang) => lang.value.startsWith(systemLanguageCode))

    if (matchedLanguage) {
      dispatch(systemLanguageMatchSucceeded(matchedLanguage.value))
    } else {
      dispatch(systemLanguageMatchFailed())
    }
  }, [dispatch])

  useEffect(() => {
    if (language === undefined) setSystemLanguage()
  }, [language, setSystemLanguage])

  const initializeClient = useCallback(async () => {
    try {
      await client.init(network.settings.nodeHost, network.settings.explorerApiHost)
      const { networkId } = await client.web3.infos.getInfosChainParams()
      dispatch(apiClientInitSucceeded({ networkId, networkName: network.name }))
    } catch (e) {
      dispatch(apiClientInitFailed({ networkName: network.name, networkStatus: network.status }))
    }
  }, [network.settings.nodeHost, network.settings.explorerApiHost, network.name, network.status, dispatch])

  useEffect(() => {
    if (network.status === 'connecting') initializeClient()
  }, [initializeClient, network.status])

  useInterval(initializeClient, 2000, network.status !== 'offline')

  useEffect(() => {
    if (network.status === 'online' && addressesStatus === 'uninitialized' && addresses.length > 0) {
      dispatch(syncAddressesData())
    }
  }, [addresses.length, addressesStatus, dispatch, network.status])

  const refreshAddressesData = useCallback(
    () => dispatch(syncAddressesData(pendingTxHashes)),
    [dispatch, pendingTxHashes]
  )

  useInterval(refreshAddressesData, 2000, pendingTxHashes.length === 0)

  useEffect(() => {
    if (network.status === 'online' && assetsInfo.status === 'uninitialized') {
      dispatch(syncNetworkTokensInfo())
    }
  }, [dispatch, network.status, assetsInfo.status])

  useEffect(() => {
    if (newVersion) setUpdateWalletModalVisible(true)
  }, [newVersion])

  useEffect(() => {
    if (newVersionDownloadTriggered) setUpdateWalletModalVisible(true)
  }, [newVersionDownloadTriggered])

  return (
    <ThemeProvider theme={theme === 'light' ? lightTheme : darkTheme}>
      <GlobalStyle />

      {splashScreenVisible && <SplashScreen onSplashScreenShown={() => setSplashScreenVisible(false)} />}

      <AppContainer showDevIndication={showDevIndication}>
        <CenteredSection>
          <Router />
        </CenteredSection>
        <BannerSection>{newVersion && <UpdateWalletBanner />}</BannerSection>
      </AppContainer>

      <SnackbarManager />
      {loading && <AppSpinner />}
      <AnimatePresence>
        {isUpdateWalletModalVisible && <UpdateWalletModal onClose={() => setUpdateWalletModalVisible(false)} />}
      </AnimatePresence>
    </ThemeProvider>
  )
}

export default App

const AppContainer = styled.div<{ showDevIndication: boolean }>`
  display: flex;
  flex-direction: column;
  flex: 1;

  background-color: ${({ theme }) => theme.bg.secondary};

  ${({ showDevIndication, theme }) =>
    showDevIndication &&
    css`
      border: 5px solid ${theme.global.valid};
    `};
`

const BannerSection = styled.div`
  flex-shrink: 0;
`

const useDevModeShortcut = () => {
  const dispatch = useAppDispatch()
  const devMode = useAppSelector((s) => s.app.devMode)

  useEffect(() => {
    if (!import.meta.env.DEV) return

    const handleKeyPress = (event: KeyboardEvent) => {
      const isCommandDShortcutPressed = event.metaKey === true && event.key === 'd' // Cmd + d (for dev)

      if (!isCommandDShortcutPressed) return

      dispatch(devModeShortcutDetected({ activate: !devMode }))
    }

    document.addEventListener('keydown', handleKeyPress)

    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [devMode, dispatch])

  return devMode
}
