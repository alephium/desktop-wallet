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

import { getWalletFromMnemonic } from '@alephium/sdk'
import { merge } from 'lodash'
import { usePostHog } from 'posthog-js/react'
import { createContext, useContext, useEffect, useState } from 'react'
import { PartialDeep } from 'type-fest'

import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import useAddressGeneration from '@/hooks/useAddressGeneration'
import useIdleForTooLong from '@/hooks/useIdleForTooLong'
import useLatestGitHubRelease from '@/hooks/useLatestGitHubRelease'
import AddressMetadataStorage from '@/storage/addresses/addressMetadataPersistentStorage'
import ContactsStorage from '@/storage/addresses/contactsPersistentStorage'
import { passwordValidationFailed } from '@/storage/auth/authActions'
import { osThemeChangeDetected } from '@/storage/global/globalActions'
import { restorePendingTransactions } from '@/storage/transactions/transactionsStorageUtils'
import { walletLocked, walletSwitched, walletUnlocked } from '@/storage/wallets/walletActions'
import WalletStorage from '@/storage/wallets/walletPersistentStorage'
import { AlephiumWindow } from '@/types/window'
import { migrateUserData } from '@/utils/migration'
import { getWalletInitialAddress } from '@/utils/wallet'

interface WalletUnlockProps {
  event: 'unlock' | 'switch'
  walletId: string
  password: string
  afterUnlock: () => void
  passphrase?: string
}

export interface GlobalContextProps {
  unlockWallet: (props: WalletUnlockProps) => void
  newVersion: string
  requiresManualDownload: boolean
  newVersionDownloadTriggered: boolean
  triggerNewVersionDownload: () => void
  resetNewVersionDownloadTrigger: () => void
}

export const initialGlobalContext: GlobalContextProps = {
  unlockWallet: () => null,
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
  const dispatch = useAppDispatch()
  const settings = useAppSelector((s) => s.settings)
  const { restoreAddressesFromMetadata } = useAddressGeneration()
  const posthog = usePostHog()

  const { newVersion, requiresManualDownload } = useLatestGitHubRelease()
  const [newVersionDownloadTriggered, setNewVersionDownloadTriggered] = useState(false)

  const triggerNewVersionDownload = () => setNewVersionDownloadTriggered(true)
  const resetNewVersionDownloadTrigger = () => setNewVersionDownloadTriggered(false)

  const unlockWallet = async ({ event, walletId, password, afterUnlock, passphrase }: WalletUnlockProps) => {
    const isPassphraseUsed = !!passphrase

    try {
      let wallet = WalletStorage.load(walletId, password)

      if (isPassphraseUsed) {
        wallet = { ...wallet, ...getWalletFromMnemonic(wallet.mnemonic, passphrase) }
      }

      const payload = {
        wallet: {
          id: walletId,
          name: wallet.name,
          mnemonic: wallet.mnemonic,
          isPassphraseUsed
        },
        initialAddress: getWalletInitialAddress(wallet)
      }
      dispatch(event === 'unlock' ? walletUnlocked(payload) : walletSwitched(payload))

      posthog?.capture(event === 'unlock' ? 'Wallet unlocked' : 'Wallet switched', {
        wallet_name_length: wallet.name.length,
        number_of_addresses: (AddressMetadataStorage.load() as []).length,
        number_of_contacts: (ContactsStorage.load() as []).length
      })

      if (!isPassphraseUsed) {
        migrateUserData()
        restoreAddressesFromMetadata()
        restorePendingTransactions()
      }

      afterUnlock()
    } catch (e) {
      dispatch(passwordValidationFailed())
    }
  }

  useIdleForTooLong(() => dispatch(walletLocked()), (settings.walletLockTimeInMinutes || 0) * 60 * 1000)

  useEffect(() => {
    const shouldListenToOSThemeChanges = settings.theme === 'system'

    if (!shouldListenToOSThemeChanges) return

    const removeOSThemeChangeListener = electron?.theme.onShouldUseDarkColors((useDark: boolean) =>
      dispatch(osThemeChangeDetected(useDark ? 'dark' : 'light'))
    )

    const removeGetNativeThemeListener = electron?.theme.onGetNativeTheme((nativeTheme) =>
      dispatch(osThemeChangeDetected(nativeTheme.shouldUseDarkColors ? 'dark' : 'light'))
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
