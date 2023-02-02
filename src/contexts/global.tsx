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

import { getHumanReadableError, getWalletFromMnemonic } from '@alephium/sdk'
import { merge } from 'lodash'
import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AsyncReturnType, PartialDeep } from 'type-fest'

import { SnackbarMessage } from '@/components/SnackbarManager'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import useIdleForTooLong from '@/hooks/useIdleForTooLong'
import useLatestGitHubRelease from '@/hooks/useLatestGitHubRelease'
import WalletStorage from '@/persistent-storage/wallet'
import { walletLocked, walletUnlocked } from '@/store/activeWalletSlice'
import { appLoadingToggled } from '@/store/appSlice'
import { apiClientInitFailed, apiClientInitSucceeded } from '@/store/networkSlice'
import { themeChanged } from '@/store/settingsSlice'
import { AlephiumWindow } from '@/types/window'
import { createClient } from '@/utils/api-clients'
import { useInterval } from '@/utils/hooks'
import { migrateUserData } from '@/utils/migration'

export type Client = Exclude<AsyncReturnType<typeof createClient>, undefined>

export interface GlobalContextProps {
  unlockWallet: (walletName: string, password: string, callback: () => void, passphrase?: string) => void
  client: Client | undefined
  snackbarMessage: SnackbarMessage | undefined
  setSnackbarMessage: (message: SnackbarMessage | undefined) => void
  newLatestVersion: string
  newVersionDownloadTriggered: boolean
  triggerNewVersionDownload: () => void
  resetNewVersionDownloadTrigger: () => void
}

export const initialGlobalContext: GlobalContextProps = {
  unlockWallet: () => null,
  client: undefined,
  snackbarMessage: undefined,
  setSnackbarMessage: () => null,
  newLatestVersion: '',
  newVersionDownloadTriggered: false,
  triggerNewVersionDownload: () => null,
  resetNewVersionDownloadTrigger: () => null
}

export const GlobalContext = createContext<GlobalContextProps>(initialGlobalContext)

const _window = window as unknown as AlephiumWindow
const electron = _window.electron

export const GlobalContextProvider: FC<{ overrideContextValue?: PartialDeep<GlobalContextProps> }> = ({
  children,
  overrideContextValue
}) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const [settings, network] = useAppSelector((s) => [s.settings, s.network])

  const [client, setClient] = useState<Client>()
  const [snackbarMessage, setSnackbarMessage] = useState<SnackbarMessage | undefined>()
  const newLatestVersion = useLatestGitHubRelease()
  const [newVersionDownloadTriggered, setNewVersionDownloadTriggered] = useState(false)

  const triggerNewVersionDownload = () => setNewVersionDownloadTriggered(true)
  const resetNewVersionDownloadTrigger = () => setNewVersionDownloadTriggered(false)

  const unlockWallet = async (walletName: string, password: string, callback: () => void, passphrase?: string) => {
    try {
      let wallet = WalletStorage.load(walletName, password)

      if (!wallet) return

      if (passphrase) {
        wallet = getWalletFromMnemonic(wallet.mnemonic, passphrase)
      }

      migrateUserData(wallet.mnemonic, walletName)

      dispatch(
        walletUnlocked({
          name: walletName,
          mnemonic: wallet.mnemonic,
          isPassphraseUsed: !!passphrase
        })
      )
      callback()
    } catch (e) {
      setSnackbarMessage({
        text: getHumanReadableError(e, t('Invalid password')),
        type: 'alert'
      })
    }
  }

  useIdleForTooLong(() => dispatch(walletLocked()), (settings.walletLockTimeInMinutes || 0) * 60 * 1000)

  const initializeClient = useCallback(async () => {
    if (network.status !== 'offline') dispatch(appLoadingToggled(true))

    const clientResp = await createClient(network.settings)
    setClient(clientResp)

    if (!clientResp || !network.settings.explorerApiHost || !network.settings.nodeHost) {
      dispatch(apiClientInitFailed())
    } else if (clientResp) {
      dispatch(apiClientInitSucceeded())

      console.log('Clients initialized.')

      setSnackbarMessage({
        text: `${t('Current network')}: ${network.name}.`,
        type: 'info',
        duration: 4000
      })
    }

    dispatch(appLoadingToggled(false))
  }, [dispatch, network.name, network.settings, network.status, t])

  useEffect(() => {
    if (network.status === 'connecting') {
      initializeClient()
    }
  }, [initializeClient, network.status])

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
  }, [network.name, network.status, t])

  useEffect(() => {
    const shouldListenToOSThemeChanges = settings.theme === 'system'

    if (!shouldListenToOSThemeChanges) return

    const removeOSThemeChangeListener = electron?.theme.onShouldUseDarkColors((useDark: boolean) =>
      dispatch(themeChanged(useDark ? 'dark' : 'light'))
    )

    const removeGetNativeThemeListener = electron?.theme.onGetNativeTheme((nativeTheme) =>
      dispatch(themeChanged(nativeTheme.shouldUseDarkColors ? 'dark' : 'light'))
    )

    electron?.theme.getNativeTheme()

    return () => {
      removeGetNativeThemeListener && removeGetNativeThemeListener()
      removeOSThemeChangeListener && removeOSThemeChangeListener()
    }
  }, [dispatch, settings.theme])

  return (
    <GlobalContext.Provider
      value={merge(
        {
          unlockWallet,
          client,
          snackbarMessage,
          setSnackbarMessage,
          newLatestVersion,
          newVersionDownloadTriggered,
          triggerNewVersionDownload,
          resetNewVersionDownloadTrigger
        },
        overrideContextValue as GlobalContextProps
      )}
    >
      {children}
    </GlobalContext.Provider>
  )
}

export const useGlobalContext = () => useContext(GlobalContext)
