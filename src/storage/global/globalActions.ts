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

import { createAction, createAsyncThunk } from '@reduxjs/toolkit'

import i18n from '@/i18n'
import { AddressHash } from '@/types/addresses'
import { ThemeType } from '@/types/settings'
import { OptionalMessage, SnackbarMessage } from '@/types/snackbar'
import { PendingTransaction } from '@/types/transactions'

type ModalId = string

export const copiedToClipboard = createAction<OptionalMessage>('app/copiedToClipboard')

export const copyToClipboardFailed = createAction<OptionalMessage>('app/copyToClipboardFailed')

export const localStorageDataMigrated = createAction('app/localStorageDataMigrated')

export const localStorageDataMigrationFailed = createAction('app/localStorageDataMigrationFailed')

export const loadingDataFromLocalStorageFailed = createAction('app/loadingDataFromLocalStorageFailed')

export const storingDataToLocalStorageFailed = createAction('app/storingDataToLocalStorageFailed')

export const modalOpened = createAction<ModalId>('app/modalOpened')

export const modalClosed = createAction('app/modalClosed')

export const addressesPageInfoMessageClosed = createAction('app/addressesPageInfoMessageClosed')

export const transfersPageInfoMessageClosed = createAction('app/transfersPageInfoMessageClosed')

export const osThemeChangeDetected = createAction<ThemeType>('app/osThemeChangeDetected')

export const devModeShortcutDetected = createAction<{ activate: boolean }>('app/devModeShortcutDetected')

export const snackbarDisplayTimeExpired = createAction('app/snackbarDisplayTimeExpired')

export const userDataMigrationFailed = createAction('app/userDataMigrationFailed')

export const receiveTestnetTokens = createAsyncThunk<PendingTransaction, AddressHash, { rejectValue: SnackbarMessage }>(
  'assets/receiveTestnetTokens',
  async (destinationAddress: AddressHash, { rejectWithValue, fulfillWithValue }) => {
    const response = await fetch('https://faucet.testnet.alephium.org/send', {
      method: 'POST',
      body: destinationAddress
    })

    if (!response.ok) {
      return rejectWithValue({
        text:
          response.status === 429
            ? i18n.t('You have reached the maximum calls limit. Please try again in a few minutes.')
            : i18n.t('Encountered error while calling the faucet.'),
        type: 'alert'
      })
    }

    const responseURL = await (await response.text()).trim()

    const hash = responseURL.match(/\/([a-fA-F0-9]+)$/)?.[1] || ''

    const pendingTransaction: PendingTransaction = {
      hash: hash,
      fromAddress: 'Faucet',
      toAddress: destinationAddress,
      amount: '12',
      timestamp: new Date().getTime(),
      status: 'pending',
      type: 'transfer'
    }

    return fulfillWithValue(pendingTransaction)
  }
)
