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

import { getStorage, Wallet, walletOpen } from 'alephium-js'
import { merge } from 'lodash'
import { createContext, FC, useContext, useEffect, useRef, useState } from 'react'
import { AsyncReturnType, PartialDeep } from 'type-fest'

import { SnackbarMessage } from '../components/SnackbarManager'
import useIdleForTooLong from '../hooks/useIdleForTooLong'
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
  currentNetwork: 'mainnet'
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
  const previousNodeHost = useRef('')
  const previousExplorerAPIHost = useRef('')

  const currentNetwork = getNetworkName(settings.network)

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
      setSnackbarMessage({ text: 'Unknown account name', type: 'alert' })
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

  useEffect(() => {
    const getClient = async () => {
      setIsClientLoading(true)

      const clientResp = await createClient(settings.network)
      if (clientResp) {
        setClient(clientResp)

        console.log('Clients initialized.')

        setSnackbarMessage({
          text: `Current network: ${currentNetwork}.`,
          type: 'info',
          duration: 4000
        })
      } else {
        setSnackbarMessage({ text: `Could not connect to the ${currentNetwork} network.`, type: 'alert' })
      }
      setIsClientLoading(false)
    }

    if (
      settings.network &&
      (previousNodeHost.current !== settings.network.nodeHost ||
        previousExplorerAPIHost.current !== settings.network.explorerApiHost)
    ) {
      getClient()
      previousNodeHost.current = settings.network.nodeHost
      previousExplorerAPIHost.current = settings.network.explorerApiHost
    }
  }, [currentNetwork, setSnackbarMessage, settings.network])

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
          currentNetwork
        },
        overrideContextValue as GlobalContextProps
      )}
    >
      {children}
    </GlobalContext.Provider>
  )
}

export const useGlobalContext = () => useContext(GlobalContext)
