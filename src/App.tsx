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
import { uniq } from 'lodash'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { ThemeProvider } from 'styled-components'

import client from '@/api/client'
import { CenteredSection } from '@/components/PageComponents/PageContainers'
import SnackbarManager from '@/components/SnackbarManager'
import SplashScreen from '@/components/SplashScreen'
import UpdateWalletBanner from '@/components/UpdateWalletBanner'
import { useGlobalContext } from '@/contexts/global'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import UpdateWalletModal from '@/modals/UpdateWalletModal'
import Router from '@/routes'
import { selectAllAddresses, syncAddressesData } from '@/store/addressesSlice'
import { apiClientInitFailed, apiClientInitSucceeded, networkSettingsMigrated } from '@/store/networkSlice'
import { selectAddressesPendingTransactions } from '@/store/pendingTransactionsSlice'
import { generalSettingsMigrated } from '@/store/settingsSlice'
import { selectAddressesUnconfirmedTransactions } from '@/store/unconfirmedTransactionsSlice'
import { GlobalStyle } from '@/style/globalStyles'
import { darkTheme, lightTheme } from '@/style/themes'
import { useInterval } from '@/utils/hooks'
import { migrateDeprecatedSettings, migrateWalletData } from '@/utils/migration'

const App = () => {
  const { t } = useTranslation()
  const { snackbarMessage, newVersion, newVersionDownloadTriggered, setSnackbarMessage } = useGlobalContext()
  const dispatch = useAppDispatch()
  const addresses = useAppSelector(selectAllAddresses)
  const addressHashes = addresses.map((address) => address.hash)
  const [allUnconfirmedTxs, allPendingTxs] = useAppSelector((s) => [
    selectAddressesUnconfirmedTransactions(s, addressHashes),
    selectAddressesPendingTransactions(s, addressHashes)
  ])
  const [settings, network, addressesStatus] = useAppSelector((s) => [
    s.settings,
    s.network,
    s.addresses.status,
    s.app.loading
  ])

  const [splashScreenVisible, setSplashScreenVisible] = useState(true)
  const [isUpdateWalletModalVisible, setUpdateWalletModalVisible] = useState(!!newVersion)

  const addressesWithUnconfirmedTxs = uniq([
    ...allUnconfirmedTxs.map((tx) => tx.address.hash),
    ...allPendingTxs.map((tx) => tx.address.hash)
  ])

  useEffect(() => {
    const localStorageSettings = migrateDeprecatedSettings()

    dispatch(generalSettingsMigrated(localStorageSettings.general))
    dispatch(networkSettingsMigrated(localStorageSettings.network))

    migrateWalletData()
  }, [dispatch])

  const initializeClient = useCallback(async () => {
    try {
      await client.init(network.settings.nodeHost, network.settings.explorerApiHost)
      dispatch(apiClientInitSucceeded())
      setSnackbarMessage({
        text: `${t('Current network')}: ${network.name}.`,
        type: 'info',
        duration: 4000
      })
    } catch (e) {
      dispatch(apiClientInitFailed())
      console.error('Could not connect to network: ', network.name)
      console.error(e)
    }
  }, [network.settings.nodeHost, network.settings.explorerApiHost, network.name, dispatch, setSnackbarMessage, t])

  // Is there a better way to trigger the initial client initialization?
  // Currently we trigger it "magically" by setting the the networkSlice status status to 'connecting', which is
  // happening when loading the stored network settings and when network settings are updated by the user.
  useEffect(() => {
    if (network.status === 'connecting') {
      initializeClient()
    }
  }, [initializeClient, network.status])

  // Is there a better way to trying to re-initialize the client? This gets "magically" triggered when the networkSlice
  // status becomes 'offline' (which is done by the `apiClientInitFailed` action)
  const shouldInitialize = network.status === 'offline'
  useInterval(initializeClient, 2000, !shouldInitialize)

  useEffect(() => {
    if (network.status === 'offline') {
      setSnackbarMessage({
        text: t('Could not connect to the {{ currentNetwork }} network.', { currentNetwork: network.name }),
        type: 'alert',
        duration: 5000
      })
    }
  }, [network.name, network.status, setSnackbarMessage, t])

  // Is there a better way to re-fetch addresses data when client goes back online?
  // Currently we trigger it "magically" by setting the addressesSlice status to 'uninitialized'
  useEffect(() => {
    if (network.status === 'online' && addressesStatus === 'uninitialized' && addresses.length > 0) {
      dispatch(syncAddressesData())
    }
  }, [addresses.length, addressesStatus, dispatch, network.status])

  useEffect(() => {
    const interval = setInterval(() => {
      if (addressesWithUnconfirmedTxs.length > 0) {
        dispatch(syncAddressesData(addressesWithUnconfirmedTxs))
      } else {
        clearInterval(interval)
      }
    }, 2000)

    return () => {
      clearInterval(interval)
    }
  }, [addressesWithUnconfirmedTxs, dispatch])

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
