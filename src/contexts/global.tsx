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

import { getStorage, getWalletFromMnemonic, Wallet, walletOpen } from '@alephium/sdk'
import { merge } from 'lodash'
import { createContext, FC, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AsyncReturnType, PartialDeep } from 'type-fest'

import { SnackbarMessage } from '@/components/SnackbarManager'
import { useAppDispatch } from '@/hooks/redux'
import useIdleForTooLong from '@/hooks/useIdleForTooLong'
import useLatestGitHubRelease from '@/hooks/useLatestGitHubRelease'
import { walletLocked, walletSaved, walletUnlocked } from '@/store/activeWalletSlice'
import { appLoadingToggled } from '@/store/appSlice'
import { NetworkStatus } from '@/types/network'
import { ThemeType } from '@/types/settings'
import { AlephiumWindow } from '@/types/window'
import { deleteStoredAddressMetadataOfWallet } from '@/utils/addresses'
import { createClient } from '@/utils/api-clients'
import { migrateUserData } from '@/utils/migration'
import {
  getNetworkName,
  loadSettings,
  migrateDeprecatedSettings,
  NetworkName,
  Settings,
  UpdateSettingsFunctionSignature,
  updateStoredSettings
} from '@/utils/settings'

export type Client = Exclude<AsyncReturnType<typeof createClient>, undefined>

const localStorageSettings = migrateDeprecatedSettings()

export interface GlobalContextProps {
  walletNames: string[]
  activeWalletName: string
  setCurrentWalletName: (walletName: string) => void
  saveWallet: (walletName: string, wallet: Wallet, password: string) => void
  deleteWallet: (w: string) => void
  lockWallet: () => void
  unlockWallet: (walletName: string, password: string, callback: () => void, passphrase?: string) => void
  client: Client | undefined
  settings: Settings
  updateSettings: UpdateSettingsFunctionSignature
  snackbarMessage: SnackbarMessage | undefined
  setSnackbarMessage: (message: SnackbarMessage | undefined) => void
  currentNetwork: NetworkName | 'custom'
  networkStatus: NetworkStatus
  updateNetworkSettings: (settings: Settings['network']) => void
  newLatestVersion: string
  newVersionDownloadTriggered: boolean
  triggerNewVersionDownload: () => void
  resetNewVersionDownloadTrigger: () => void
  isPassphraseUsed: boolean
}

export const initialGlobalContext: GlobalContextProps = {
  walletNames: [],
  activeWalletName: '',
  setCurrentWalletName: () => null,
  saveWallet: () => null,
  deleteWallet: () => null,
  lockWallet: () => null,
  unlockWallet: () => null,
  client: undefined,
  settings: localStorageSettings,
  updateSettings: () => null,
  snackbarMessage: undefined,
  setSnackbarMessage: () => null,
  currentNetwork: 'mainnet',
  networkStatus: 'uninitialized',
  updateNetworkSettings: () => null,
  newLatestVersion: '',
  newVersionDownloadTriggered: false,
  triggerNewVersionDownload: () => null,
  resetNewVersionDownloadTrigger: () => null,
  isPassphraseUsed: false
}

export const GlobalContext = createContext<GlobalContextProps>(initialGlobalContext)

const Storage = getStorage()
const _window = window as unknown as AlephiumWindow
const electron = _window.electron

export const GlobalContextProvider: FC<{ overrideContextValue?: PartialDeep<GlobalContextProps> }> = ({
  children,
  overrideContextValue
}) => {
  const { t } = useTranslation('App')
  const [walletNames, setWalletNames] = useState<string[]>(Storage.list())
  const [activeWalletName, setCurrentWalletName] = useState('')
  const [client, setClient] = useState<Client>()
  const [snackbarMessage, setSnackbarMessage] = useState<SnackbarMessage | undefined>()
  const [settings, setSettings] = useState<Settings>(localStorageSettings)
  const previousNodeHost = useRef<string>()
  const previousExplorerAPIHost = useRef<string>()
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>('uninitialized')
  const [isPassphraseUsed, setIsPassphraseUsed] = useState(false)
  const currentNetwork = getNetworkName(settings.network)
  const newLatestVersion = useLatestGitHubRelease()
  const [newVersionDownloadTriggered, setNewVersionDownloadTriggered] = useState(false)
  const dispatch = useAppDispatch()

  const triggerNewVersionDownload = () => setNewVersionDownloadTriggered(true)
  const resetNewVersionDownloadTrigger = () => setNewVersionDownloadTriggered(false)

  const updateSettings: UpdateSettingsFunctionSignature = (settingKeyToUpdate, newSettings) => {
    const updatedSettings = updateStoredSettings(settingKeyToUpdate, newSettings)
    updatedSettings && setSettings(updatedSettings)
    return updatedSettings
  }

  const updateNetworkSettings = (newNetworkSettings: Settings['network']) => {
    setNetworkStatus('connecting')
    updateSettings('network', newNetworkSettings)
  }

  const saveWallet = (walletName: string, wallet: Wallet, password: string) => {
    const walletEncrypted = wallet.encrypt(password)
    Storage.save(walletName, walletEncrypted)
    setWalletNames(Storage.list())
    dispatch(
      walletSaved({
        name: walletName,
        mnemonic: wallet.mnemonic
      })
    )
  }

  const deleteWallet = (walletName: string) => {
    Storage.remove(walletName)
    deleteStoredAddressMetadataOfWallet(walletName)
    setWalletNames(Storage.list())
  }

  const lockWallet = () => {
    setCurrentWalletName('')
    setIsPassphraseUsed(false)
    dispatch(walletLocked())
  }

  const unlockWallet = async (walletName: string, password: string, callback: () => void, passphrase?: string) => {
    const walletEncrypted = Storage.load(walletName)

    if (!walletEncrypted) {
      setSnackbarMessage({ text: t`Unknown wallet name`, type: 'alert' })
      return
    }

    try {
      let wallet = walletOpen(password, walletEncrypted)

      if (!wallet) return

      if (passphrase) {
        wallet = getWalletFromMnemonic(wallet.mnemonic, passphrase)
      }

      migrateUserData(wallet.mnemonic, walletName)

      setIsPassphraseUsed(!!passphrase)
      dispatch(
        walletUnlocked({
          name: walletName,
          mnemonic: wallet.mnemonic
        })
      )
      setCurrentWalletName(walletName)
      callback()
    } catch (e) {
      setSnackbarMessage({ text: t`Invalid password`, type: 'alert' })
    }
  }

  useIdleForTooLong(lockWallet, (settings.general.walletLockTimeInMinutes || 0) * 60 * 1000)

  const getClient = useCallback(async () => {
    if (networkStatus !== 'offline') dispatch(appLoadingToggled(true))

    const clientResp = await createClient(settings.network)
    setClient(clientResp)

    if (!clientResp || !settings.network.explorerApiHost || !settings.network.nodeHost) {
      setNetworkStatus('offline')
    } else if (clientResp) {
      setNetworkStatus('online')

      console.log('Clients initialized.')

      setSnackbarMessage({
        text: `${t`Current network`}: ${currentNetwork}.`,
        type: 'info',
        duration: 4000
      })
    }

    dispatch(appLoadingToggled(false))
  }, [currentNetwork, dispatch, networkStatus, settings.network, t])

  useEffect(() => {
    const networkSettingsHaveChanged =
      previousNodeHost.current !== settings.network.nodeHost ||
      previousExplorerAPIHost.current !== settings.network.explorerApiHost

    if (networkSettingsHaveChanged) {
      getClient()
      previousNodeHost.current = settings.network.nodeHost
      previousExplorerAPIHost.current = settings.network.explorerApiHost
    }
  }, [currentNetwork, getClient, networkStatus, setSnackbarMessage, settings.network])

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>
    if (networkStatus === 'offline') {
      interval = setInterval(getClient, 2000)
    }
    return () => clearInterval(interval)
  })

  useEffect(() => {
    if (networkStatus === 'offline') {
      setSnackbarMessage({
        text: t('Could not connect to the {{ currentNetwork }} network.', { currentNetwork }),
        type: 'alert',
        duration: 5000
      })
    }
  }, [currentNetwork, networkStatus, t])

  const switchTheme = useCallback((theme: ThemeType) => {
    setSettings((prevState) => ({
      ...prevState,
      general: {
        ...prevState.general,
        theme
      }
    }))
  }, [])

  useEffect(() => {
    const storedSettings = loadSettings()
    const shouldListenToOSThemeChanges = storedSettings.general.theme === 'system'

    if (!shouldListenToOSThemeChanges) return

    const removeOSThemeChangeListener = electron?.theme.onShouldUseDarkColors((useDark: boolean) =>
      switchTheme(useDark ? 'dark' : 'light')
    )

    const removeGetNativeThemeListener = electron?.theme.onGetNativeTheme((nativeTheme) =>
      switchTheme(nativeTheme.shouldUseDarkColors ? 'dark' : 'light')
    )

    electron?.theme.getNativeTheme()

    return () => {
      removeGetNativeThemeListener && removeGetNativeThemeListener()
      removeOSThemeChangeListener && removeOSThemeChangeListener()
    }
  }, [settings.general.theme, switchTheme])

  return (
    <GlobalContext.Provider
      value={merge(
        {
          walletNames,
          setWalletNames,
          activeWalletName,
          setCurrentWalletName,
          saveWallet,
          deleteWallet,
          lockWallet,
          unlockWallet,
          client,
          snackbarMessage,
          setSnackbarMessage,
          settings,
          updateSettings,
          currentNetwork,
          networkStatus,
          updateNetworkSettings,
          newLatestVersion,
          newVersionDownloadTriggered,
          triggerNewVersionDownload,
          resetNewVersionDownloadTrigger,
          isPassphraseUsed
        },
        overrideContextValue as GlobalContextProps
      )}
    >
      {children}
    </GlobalContext.Provider>
  )
}

export const useGlobalContext = () => useContext(GlobalContext)
