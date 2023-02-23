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
import { selectAllAddresses, syncAddressesData } from '@/storage/app-state/slices/addressesSlice'
import { syncNetworkTokensInfo } from '@/storage/app-state/slices/assetsInfoSlice'
import {
  apiClientInitFailed,
  apiClientInitSucceeded,
  networkSettingsMigrated
} from '@/storage/app-state/slices/networkSlice'
import { selectAddressesPendingTransactions } from '@/storage/app-state/slices/pendingTransactionsSlice'
import { generalSettingsMigrated } from '@/storage/app-state/slices/settingsSlice'
import { GlobalStyle } from '@/style/globalStyles'
import { darkTheme, lightTheme } from '@/style/themes'
import { useInterval } from '@/utils/hooks'
import { migrateGeneralSettings, migrateNetworkSettings, migrateWalletData } from '@/utils/migration'

const App = () => {
  const { t } = useTranslation()
  const { snackbarMessage, newVersion, newVersionDownloadTriggered, setSnackbarMessage } = useGlobalContext()
  const dispatch = useAppDispatch()
  const addresses = useAppSelector(selectAllAddresses)
  const addressHashes = addresses.map((address) => address.hash)
  const pendingTxHashes = useAppSelector((s) => selectAddressesPendingTransactions(s, addressHashes)).map(
    (tx) => tx.address.hash
  )
  const [settings, network, addressesStatus, isPassphraseUsed, assetsInfo] = useAppSelector((s) => [
    s.settings,
    s.network,
    s.addresses.status,
    s.activeWallet.isPassphraseUsed,
    s.assetsInfo
  ])

  const [splashScreenVisible, setSplashScreenVisible] = useState(true)
  const [isUpdateWalletModalVisible, setUpdateWalletModalVisible] = useState(!!newVersion)

  useEffect(() => {
    const localStorageGeneralSettings = migrateGeneralSettings()
    const localStorageNetworkSettings = migrateNetworkSettings()

    dispatch(generalSettingsMigrated(localStorageGeneralSettings))
    dispatch(networkSettingsMigrated(localStorageNetworkSettings))

    if (!isPassphraseUsed) migrateWalletData()
  }, [dispatch, isPassphraseUsed])

  const initializeClient = useCallback(async () => {
    try {
      await client.init(network.settings.nodeHost, network.settings.explorerApiHost)
      const { networkId } = await client.web3.infos.getInfosChainParams()
      dispatch(apiClientInitSucceeded(networkId))
    } catch (e) {
      dispatch(apiClientInitFailed())
      console.error('Could not connect to network: ', network.name, e)
    }
  }, [network.settings.nodeHost, network.settings.explorerApiHost, network.name, dispatch])

  // Is there a better way to trigger the initial client initialization?
  // Currently we trigger it is a side-effect of setting the networkSlice status to 'connecting', which is happening
  // when loading the stored network settings and when network settings are updated by the user.
  useEffect(() => {
    if (network.status === 'connecting') {
      initializeClient()
    } else if (network.status === 'offline') {
      setSnackbarMessage({
        text: t('Could not connect to the {{ currentNetwork }} network.', { currentNetwork: network.name }),
        type: 'alert',
        duration: 5000
      })
    } else if (network.status === 'online') {
      setSnackbarMessage({
        text: `${t('Current network')}: ${network.name}.`,
        type: 'info',
        duration: 4000
      })
    }
  }, [initializeClient, network.name, network.status, setSnackbarMessage, t])

  // Is there a better way to trying to re-initialize the client? This gets "magically" triggered when the networkSlice
  // status becomes 'offline' (which is done by the `apiClientInitFailed` action)
  useInterval(initializeClient, 2000, network.status !== 'offline')

  // Is there a better way to re-fetch addresses data when client goes back online?
  // Currently we trigger it "magically" by setting the addressesSlice status to 'uninitialized'
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
