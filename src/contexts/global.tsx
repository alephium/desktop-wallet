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

import { getStorage, Wallet, walletOpen } from '@alephium/sdk'
import { merge } from 'lodash'
import { createContext, FC, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { AsyncReturnType, PartialDeep } from 'type-fest'

import { SnackbarMessage } from '../components/SnackbarManager'
import useIdleForTooLong from '../hooks/useIdleForTooLong'
import useLatestGitHubRelease from '../hooks/useLatestGitHubRelease'
import { createClient } from '../utils/api-clients'
import {
  deprecatedSettingsExist,
  getNetworkName,
  loadSettings,
  migrateDeprecatedSettings,
  NetworkType,
  Settings,
  storeSettings,
  UpdateSettingsFunctionSignature,
  updateStoredSettings
} from '../utils/settings'

let localStorageSettings = loadSettings()

if (deprecatedSettingsExist()) {
  localStorageSettings = migrateDeprecatedSettings()
}

export interface GlobalContextProps {
  currentAccountName: string
  setCurrentAccountName: (accountName: string) => void
  wallet?: Wallet
  setWallet: (w: Wallet | undefined) => void
  lockWallet: () => void
  login: (accountName: string, password: string, callback: () => void) => void
  client: Client | undefined
  settings: Settings
  updateSettings: UpdateSettingsFunctionSignature
  snackbarMessage: SnackbarMessage | undefined
  setSnackbarMessage: (message: SnackbarMessage | undefined) => void
  isClientLoading: boolean
  currentNetwork: NetworkType | 'custom'
  isOffline: boolean
  setIsOffline: (b: boolean) => void
  newLatestVersion: string
}

export type Client = AsyncReturnType<typeof createClient>

export const initialGlobalContext: GlobalContextProps = {
  currentAccountName: '',
  setCurrentAccountName: () => null,
  wallet: undefined,
  setWallet: () => null,
  lockWallet: () => null,
  login: () => null,
  client: undefined,
  settings: localStorageSettings,
  updateSettings: () => null,
  snackbarMessage: undefined,
  setSnackbarMessage: () => null,
  isClientLoading: false,
  currentNetwork: 'mainnet',
  isOffline: false,
  setIsOffline: () => null,
  newLatestVersion: ''
}

export const GlobalContext = createContext<GlobalContextProps>(initialGlobalContext)

const Storage = getStorage()

export const GlobalContextProvider: FC<{ overrideContextValue?: PartialDeep<GlobalContextProps> }> = ({
  children,
  overrideContextValue
}) => {
  const [wallet, setWallet] = useState<Wallet>()
  const [currentAccountName, setCurrentAccountName] = useState('')
  const [client, setClient] = useState<Client>()
  const [snackbarMessage, setSnackbarMessage] = useState<SnackbarMessage | undefined>()
  const [settings, setSettings] = useState<Settings>(localStorageSettings)
  const [isClientLoading, setIsClientLoading] = useState(false)
  const previousNodeHost = useRef<string>()
  const previousExplorerAPIHost = useRef<string>()
  const [isOffline, setIsOffline] = useState(true)
  const currentNetwork = getNetworkName(settings.network)
  const newLatestVersion = useLatestGitHubRelease()

  const updateSettings: UpdateSettingsFunctionSignature = (settingKeyToUpdate, newSettings) => {
    const updatedSettings = updateStoredSettings(settingKeyToUpdate, newSettings)
    updatedSettings && setSettings(updatedSettings)
    return updatedSettings
  }

  const lockWallet = () => {
    setCurrentAccountName('')
    setWallet(undefined)
  }

  const login = async (accountName: string, password: string, callback: () => void) => {
    const walletEncrypted = Storage.load(accountName)
    if (!walletEncrypted) {
      setSnackbarMessage({ text: 'Unknown wallet name', type: 'alert' })
      return
    }
    try {
      const wallet = walletOpen(password, walletEncrypted)
      if (!wallet) return
      setWallet(wallet)
      setCurrentAccountName(accountName)
      callback()
    } catch (e) {
      setSnackbarMessage({ text: 'Invalid password', type: 'alert' })
    }
  }

  useIdleForTooLong(lockWallet, (settings.general.walletLockTimeInMinutes || 0) * 60 * 1000)

  const getClient = useCallback(async () => {
    setIsClientLoading(true)

    const clientResp = await createClient(settings.network)
    setClient(clientResp)

    if (!clientResp || !settings.network.explorerApiHost || !settings.network.nodeHost) {
      setIsOffline(true)
    } else if (clientResp) {
      setIsOffline(false)

      console.log('Clients initialized.')

      setSnackbarMessage({
        text: `Current network: ${currentNetwork}.`,
        type: 'info',
        duration: 4000
      })
    }
    setIsClientLoading(false)
  }, [currentNetwork, settings.network])

  useEffect(() => {
    const networkSettingsHaveChanged =
      previousNodeHost.current !== settings.network.nodeHost ||
      previousExplorerAPIHost.current !== settings.network.explorerApiHost

    if (networkSettingsHaveChanged) {
      getClient()
      previousNodeHost.current = settings.network.nodeHost
      previousExplorerAPIHost.current = settings.network.explorerApiHost
    }
  }, [currentNetwork, getClient, isOffline, setSnackbarMessage, settings.network])

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>
    if (isOffline) {
      interval = setInterval(getClient, 2000)
    }
    return () => clearInterval(interval)
  })

  useEffect(() => {
    if (isOffline) {
      setSnackbarMessage({ text: `Could not connect to the ${currentNetwork} network.`, type: 'alert', duration: 5000 })
    }
  }, [currentNetwork, isOffline])

  // Save settings to local storage
  useEffect(() => {
    storeSettings(settings)
  }, [settings])

  return (
    <GlobalContext.Provider
      value={merge(
        {
          currentAccountName,
          setCurrentAccountName,
          wallet,
          setWallet,
          lockWallet,
          login,
          client,
          snackbarMessage,
          setSnackbarMessage,
          settings,
          updateSettings,
          isClientLoading,
          currentNetwork,
          isOffline,
          setIsOffline,
          newLatestVersion
        },
        overrideContextValue as GlobalContextProps
      )}
    >
      {children}
    </GlobalContext.Provider>
  )
}

export const useGlobalContext = () => useContext(GlobalContext)
