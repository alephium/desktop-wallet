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
import { createContext, useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PartialDeep } from 'type-fest'

import { SnackbarMessage } from '@/components/SnackbarManager'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import useAddressGeneration from '@/hooks/useAddressGeneration'
import useIdleForTooLong from '@/hooks/useIdleForTooLong'
import useLatestGitHubRelease from '@/hooks/useLatestGitHubRelease'
import { walletLocked, walletSwitched, walletUnlocked } from '@/storage/app-state/slices/activeWalletSlice'
import { themeChanged } from '@/storage/app-state/slices/settingsSlice'
import WalletStorage from '@/storage/persistent-storage/walletPersistentStorage'
import { AlephiumWindow } from '@/types/window'
import { migrateUserData } from '@/utils/migration'

interface WalletUnlockProps {
  event: 'login' | 'switch'
  walletName: string
  password: string
  afterUnlock: () => void
  passphrase?: string
}

export interface GlobalContextProps {
  unlockWallet: (props: WalletUnlockProps) => void
  snackbarMessage: SnackbarMessage | undefined
  setSnackbarMessage: (message: SnackbarMessage | undefined) => void
  newVersion: string
  requiresManualDownload: boolean
  newVersionDownloadTriggered: boolean
  triggerNewVersionDownload: () => void
  resetNewVersionDownloadTrigger: () => void
}

export const initialGlobalContext: GlobalContextProps = {
  unlockWallet: () => null,
  snackbarMessage: undefined,
  setSnackbarMessage: () => null,
  newVersion: '',
  requiresManualDownload: false,
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
  const settings = useAppSelector((s) => s.settings)
  const { restoreAddressesFromMetadata } = useAddressGeneration()

  const [snackbarMessage, setSnackbarMessage] = useState<SnackbarMessage | undefined>()
  const { newVersion, requiresManualDownload } = useLatestGitHubRelease()
  const [newVersionDownloadTriggered, setNewVersionDownloadTriggered] = useState(false)

  const triggerNewVersionDownload = () => setNewVersionDownloadTriggered(true)
  const resetNewVersionDownloadTrigger = () => setNewVersionDownloadTriggered(false)

  const unlockWallet = async ({ event, walletName, password, afterUnlock, passphrase }: WalletUnlockProps) => {
    const isPassphraseUsed = !!passphrase
    try {
      let wallet = WalletStorage.load(walletName, password)

      if (passphrase) {
        wallet = getWalletFromMnemonic(wallet.mnemonic, passphrase)
      }

      migrateUserData(wallet.mnemonic, walletName)

      const payload = {
        name: walletName,
        mnemonic: wallet.mnemonic,
        isPassphraseUsed
      }
      dispatch(event === 'login' ? walletUnlocked(payload) : walletSwitched(payload))

      restoreAddressesFromMetadata({ walletName, mnemonic: wallet.mnemonic, isPassphraseUsed })

      afterUnlock()
    } catch (e) {
      setSnackbarMessage({
        text: getHumanReadableError(e, t('Invalid password')),
        type: 'alert'
      })
    }
  }

  useIdleForTooLong(() => dispatch(walletLocked()), (settings.walletLockTimeInMinutes || 0) * 60 * 1000)

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
          snackbarMessage,
          setSnackbarMessage,
          newVersion,
          requiresManualDownload,
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
