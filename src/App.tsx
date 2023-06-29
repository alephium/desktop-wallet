/*
Copyright 2018 - 2023 The Alephium Authors
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
import { difference } from 'lodash'
import { usePostHog } from 'posthog-js/react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import styled, { css, ThemeProvider } from 'styled-components'

import client from '@/api/client'
import AppSpinner from '@/components/AppSpinner'
import { CenteredSection } from '@/components/PageComponents/PageContainers'
import SnackbarManager from '@/components/SnackbarManager'
import SplashScreen from '@/components/SplashScreen'
import UpdateWalletBanner from '@/components/UpdateWalletBanner'
import { useGlobalContext } from '@/contexts/global'
import { WalletConnectContextProvider } from '@/contexts/walletconnect'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import UpdateWalletModal from '@/modals/UpdateWalletModal'
import Router from '@/routes'
import { syncAddressesData, syncAddressesHistoricBalances } from '@/storage/addresses/addressesActions'
import { selectAddressIds, selectAllUnknownTokens } from '@/storage/addresses/addressesSelectors'
import { syncNetworkTokensInfo, syncUnknownTokensInfo } from '@/storage/assets/assetsActions'
import { selectIsTokensMetadataUninitialized } from '@/storage/assets/assetsSelectors'
import {
  devModeShortcutDetected,
  localStorageDataMigrated,
  localStorageDataMigrationFailed
} from '@/storage/global/globalActions'
import { apiClientInitFailed, apiClientInitSucceeded } from '@/storage/settings/networkActions'
import { systemLanguageMatchFailed, systemLanguageMatchSucceeded } from '@/storage/settings/settingsActions'
import { makeSelectAddressesHashesWithPendingTransactions } from '@/storage/transactions/transactionsSelectors'
import {
  getStoredPendingTransactions,
  restorePendingTransactions
} from '@/storage/transactions/transactionsStorageUtils'
import { GlobalStyle } from '@/style/globalStyles'
import { darkTheme, lightTheme } from '@/style/themes'
import { AddressHash } from '@/types/addresses'
import { AlephiumWindow } from '@/types/window'
import { useInterval } from '@/utils/hooks'
import { migrateGeneralSettings, migrateNetworkSettings, migrateWalletData } from '@/utils/migration'
import { languageOptions } from '@/utils/settings'

const App = () => {
  const { newVersion, newVersionDownloadTriggered } = useGlobalContext()
  const dispatch = useAppDispatch()
  const addressHashes = useAppSelector(selectAddressIds) as AddressHash[]
  const selectAddressesHashesWithPendingTransactions = useMemo(makeSelectAddressesHashesWithPendingTransactions, [])
  const addressesWithPendingTxs = useAppSelector(selectAddressesHashesWithPendingTransactions)
  const network = useAppSelector((s) => s.network)
  const theme = useAppSelector((s) => s.global.theme)
  const assetsInfo = useAppSelector((s) => s.assetsInfo)
  const loading = useAppSelector((s) => s.global.loading)
  const settings = useAppSelector((s) => s.settings)
  const wallets = useAppSelector((s) => s.global.wallets)
  const showDevIndication = useDevModeShortcut()
  const posthog = usePostHog()

  const addressesStatus = useAppSelector((s) => s.addresses.status)
  const isSyncingAddressData = useAppSelector((s) => s.addresses.syncingAddressData)
  const isTokensMetadataUninitialized = useAppSelector(selectIsTokensMetadataUninitialized)
  const isLoadingTokensMetadata = useAppSelector((s) => s.assetsInfo.loading)

  const unknownTokens = useAppSelector(selectAllUnknownTokens)
  const checkedUnknownTokenIds = useAppSelector((s) => s.assetsInfo.checkedUnknownTokenIds)
  const unknownTokenIds = unknownTokens.map((token) => token.id)
  const newUnknownTokens = difference(unknownTokenIds, checkedUnknownTokenIds)

  const [splashScreenVisible, setSplashScreenVisible] = useState(true)
  const [isUpdateWalletModalVisible, setUpdateWalletModalVisible] = useState(!!newVersion)

  useEffect(() => {
    try {
      migrateGeneralSettings()
      migrateNetworkSettings()
      migrateWalletData()

      dispatch(localStorageDataMigrated())
    } catch (e) {
      console.error(e)
      posthog.capture('Error', { message: 'Local storage data migration failed' })
      dispatch(localStorageDataMigrationFailed())
    }
  }, [dispatch, posthog])

  useEffect(() => {
    posthog.people.set({
      wallets: wallets.length,
      theme: settings.theme,
      devTools: settings.devTools,
      lockTimeInMs: settings.walletLockTimeInMinutes,
      language: settings.language,
      passwordRequirement: settings.passwordRequirement,
      fiatCurrency: settings.fiatCurrency,
      network: network.name
    })
  }, [network.name, posthog.people, settings, wallets.length])

  const setSystemLanguage = useCallback(async () => {
    const _window = window as unknown as AlephiumWindow
    const electron = _window.electron
    const systemLanguage = await electron?.app.getSystemLanguage()

    if (!systemLanguage) {
      dispatch(systemLanguageMatchFailed())
      return
    }

    const systemLanguageCode = systemLanguage.substring(0, 2)
    const matchedLanguage = languageOptions.find((lang) => lang.value.startsWith(systemLanguageCode))

    if (matchedLanguage) {
      dispatch(systemLanguageMatchSucceeded(matchedLanguage.value))
    } else {
      dispatch(systemLanguageMatchFailed())
    }
  }, [dispatch])

  useEffect(() => {
    if (settings.language === undefined) setSystemLanguage()
  }, [settings.language, setSystemLanguage])

  const initializeClient = useCallback(async () => {
    try {
      client.init(network.settings.nodeHost, network.settings.explorerApiHost)
      const { networkId } = await client.node.infos.getInfosChainParams()
      // TODO: Check if connection to explorer also works
      dispatch(apiClientInitSucceeded({ networkId, networkName: network.name }))
    } catch (e) {
      // Discuss: Do we want to capture client init errors?
      dispatch(apiClientInitFailed({ networkName: network.name, networkStatus: network.status }))
    }
  }, [network.settings.nodeHost, network.settings.explorerApiHost, network.name, network.status, dispatch])

  useEffect(() => {
    if (network.status === 'connecting') initializeClient()
  }, [initializeClient, network.status])

  useInterval(initializeClient, 2000, network.status !== 'offline')

  useEffect(() => {
    if (network.status === 'online') {
      if (assetsInfo.status === 'uninitialized' && !isLoadingTokensMetadata) {
        dispatch(syncNetworkTokensInfo())
      }
      if (addressesStatus === 'uninitialized') {
        if (!isSyncingAddressData && addressHashes.length > 0) {
          const storedPendingTxs = getStoredPendingTransactions()

          dispatch(syncAddressesData())
            .unwrap()
            .then((results) => {
              const mempoolTxHashes = results.flatMap((result) => result.mempoolTransactions.map((tx) => tx.hash))

              restorePendingTransactions(mempoolTxHashes, storedPendingTxs)
            })
          dispatch(syncAddressesHistoricBalances())
        }
      } else if (addressesStatus === 'initialized') {
        if (!isTokensMetadataUninitialized && !isLoadingTokensMetadata && newUnknownTokens.length > 0) {
          dispatch(syncUnknownTokensInfo(newUnknownTokens))
        }
      }
    }
  }, [
    addressHashes.length,
    addressesStatus,
    assetsInfo.status,
    dispatch,
    isSyncingAddressData,
    isLoadingTokensMetadata,
    isTokensMetadataUninitialized,
    network.status,
    newUnknownTokens
  ])

  const refreshAddressesData = useCallback(() => {
    dispatch(syncAddressesData(addressesWithPendingTxs))
  }, [dispatch, addressesWithPendingTxs])

  useInterval(refreshAddressesData, 5000, addressesWithPendingTxs.length === 0 || isSyncingAddressData)

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

      <WalletConnectContextProvider>
        <AppContainer showDevIndication={showDevIndication}>
          <CenteredSection>
            <Router />
          </CenteredSection>
          <BannerSection>{newVersion && <UpdateWalletBanner />}</BannerSection>
        </AppContainer>
      </WalletConnectContextProvider>

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
  const devMode = useAppSelector((s) => s.global.devMode)

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
