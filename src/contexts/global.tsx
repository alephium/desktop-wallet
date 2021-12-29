/*
Copyright 2018 - 2021 The Alephium Authors
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

import { Wallet } from 'alephium-js'
import { merge } from 'lodash'
import { createContext, FC, useContext, useEffect, useRef, useState } from 'react'
import { AsyncReturnType, PartialDeep } from 'type-fest'

import { SnackbarMessage } from '../components/SnackbarManager'
import useIdleForTooLong from '../hooks/useIdleForTooLong'
import { createClient } from '../utils/api-clients'
import {
  getNetworkName,
  loadStoredSettings,
  NetworkType,
  saveStoredSettings,
  Settings,
  UpdateSettingsFunctionSignature,
  updateStoredSettings
} from '../utils/settings'

export interface GlobalContextProps {
  currentUsername: string
  setCurrentUsername: (username: string) => void
  wallet?: Wallet
  setWallet: (w: Wallet | undefined) => void
  lockWallet: () => void
  client: Client | undefined
  settings: Settings
  updateSettings: UpdateSettingsFunctionSignature
  snackbarMessage: SnackbarMessage | undefined
  setSnackbarMessage: (message: SnackbarMessage | undefined) => void
  isClientLoading: boolean
  currentNetwork: NetworkType | 'custom'
}

type Client = AsyncReturnType<typeof createClient>

export const initialGlobalContext: GlobalContextProps = {
  currentUsername: '',
  setCurrentUsername: () => null,
  wallet: undefined,
  setWallet: () => null,
  lockWallet: () => null,
  client: undefined,
  settings: loadStoredSettings(),
  updateSettings: () => null,
  snackbarMessage: undefined,
  setSnackbarMessage: () => null,
  isClientLoading: false,
  currentNetwork: 'mainnet'
}

export const GlobalContext = createContext<GlobalContextProps>(initialGlobalContext)

export const GlobalContextProvider: FC<{ overrideContextValue?: PartialDeep<GlobalContextProps> }> = ({
  children,
  overrideContextValue
}) => {
  const [wallet, setWallet] = useState<Wallet>()
  const [currentUsername, setCurrentUsername] = useState('')
  const [client, setClient] = useState<Client>()
  const [snackbarMessage, setSnackbarMessage] = useState<SnackbarMessage | undefined>()
  const [settings, setSettings] = useState<Settings>(loadStoredSettings())
  const [isClientLoading, setIsClientLoading] = useState(false)

  const currentNetwork = getNetworkName(settings.network)
  const previousNetwork = useRef<NetworkType>()

  const updateSettings: UpdateSettingsFunctionSignature = (settingKeyToUpdate, newSettings) => {
    const updatedSettings = updateStoredSettings(settingKeyToUpdate, newSettings)
    updatedSettings && setSettings(updatedSettings)
    return updatedSettings
  }

  const lockWallet = () => setWallet(undefined)

  useIdleForTooLong(lockWallet, (settings.general.walletLockTimeInMinutes || 0) * 60 * 1000)

  useEffect(() => {
    const getClient = async () => {
      if (previousNetwork.current === currentNetwork) return

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

        previousNetwork.current = currentNetwork
      } else {
        setSnackbarMessage({ text: `Could not connect to the ${currentNetwork} network.`, type: 'alert' })
      }
      setIsClientLoading(false)
    }

    getClient()
  }, [currentNetwork, setSnackbarMessage, settings.network])

  // Save settings to local storage
  useEffect(() => {
    saveStoredSettings(settings)
  }, [settings])

  return (
    <GlobalContext.Provider
      value={merge(
        {
          currentUsername,
          setCurrentUsername,
          wallet,
          setWallet,
          lockWallet,
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
