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

import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import i18n from '@/i18n'
import { contactDeletedFromPeristentStorage, syncAddressesData } from '@/storage/addresses/addressesActions'
import { contactStorageFailed, contactStoredInPersistentStorage } from '@/storage/addresses/addressesActions'
import { passwordValidationFailed } from '@/storage/auth/authActions'
import { walletConnectPairingFailed, walletConnectProposalApprovalFailed } from '@/storage/dApps/dAppActions'
import { copiedToClipboard, copyToClipboardFailed, snackbarDisplayTimeExpired } from '@/storage/global/globalActions'
import { devModeShortcutDetected } from '@/storage/global/globalActions'
import {
  apiClientInitFailed,
  apiClientInitSucceeded,
  customNetworkSettingsSaved
} from '@/storage/settings/networkActions'
import {
  csvFileGenerationFinished,
  csvFileGenerationStarted,
  fetchTransactionsCsv,
  transactionBuildFailed,
  transactionSendFailed,
  transactionsSendSucceeded
} from '@/storage/transactions/transactionsActions'
import { newWalletNameStored } from '@/storage/wallets/walletActions'
import { walletCreationFailed, walletNameStorageFailed } from '@/storage/wallets/walletActions'
import { Message, SnackbarMessage } from '@/types/snackbar'

interface SnackbarSliceState {
  messages: Required<SnackbarMessage>[]
  offlineMessageWasVisibleOnce: boolean
}

const initialState: SnackbarSliceState = {
  messages: [],
  offlineMessageWasVisibleOnce: false
}

const snackbarSlice = createSlice({
  name: 'snackbar',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(snackbarDisplayTimeExpired, (state) => {
        if (state.messages.length > 0) state.messages.shift()
      })
      .addCase(syncAddressesData.rejected, (state, action) => {
        const message = action.payload

        if (message) queueMessage(state, message)
      })
      .addCase(apiClientInitSucceeded, (state, action) => {
        state.offlineMessageWasVisibleOnce = false

        queueMessage(state, {
          text: `${i18n.t('Current network')}: ${action.payload.networkName}.`,
          duration: 4000
        })
      })
      .addCase(apiClientInitFailed, (state, action) => {
        if (!state.offlineMessageWasVisibleOnce)
          queueMessage(state, {
            text: i18n.t('Could not connect to the {{ currentNetwork }} network.', {
              currentNetwork: action.payload.networkName
            }),
            type: 'alert',
            duration: 5000
          })

        state.offlineMessageWasVisibleOnce = true
      })
      .addCase(contactStoredInPersistentStorage, (state) =>
        displayMessageImmediately(state, { text: i18n.t('Contact saved'), type: 'success' })
      )
      .addCase(contactDeletedFromPeristentStorage, (state) =>
        displayMessageImmediately(state, { text: i18n.t('Contact deleted'), type: 'success' })
      )
      .addCase(customNetworkSettingsSaved, (state) =>
        displayMessageImmediately(state, { text: i18n.t('Custom network settings saved.') })
      )
      .addCase(transactionBuildFailed, displayError)
      .addCase(transactionSendFailed, displayError)
      .addCase(contactStorageFailed, displayError)
      .addCase(walletCreationFailed, displayError)
      .addCase(transactionsSendSucceeded, (state, action) => {
        const { nbOfTransactionsSent } = action.payload

        displayMessageImmediately(state, {
          text: nbOfTransactionsSent > 1 ? i18n.t('Transactions sent!') : i18n.t('Transaction sent!'),
          type: 'success'
        })
      })
      .addCase(copiedToClipboard, (state, action) =>
        displayMessageImmediately(state, { text: action.payload || i18n.t('Copied to clipboard!') })
      )
      .addCase(copyToClipboardFailed, (state, action) =>
        displayMessageImmediately(state, { text: action.payload || i18n.t('Copy to clipboard failed'), type: 'alert' })
      )
      .addCase(passwordValidationFailed, (state) =>
        displayMessageImmediately(state, { text: i18n.t('Invalid password'), type: 'alert' })
      )
      .addCase(devModeShortcutDetected, (state, action) =>
        displayMessageImmediately(
          state,
          action.payload.activate
            ? { text: '💪 GOD mode activated!', type: 'success' }
            : { text: '👩‍🌾 Back to a common mortal...' }
        )
      )
      .addCase(newWalletNameStored, (state, action) =>
        displayMessageImmediately(state, {
          text: i18n.t('Wallet name updated to: {{ newWalletName }}', { newWalletName: action.payload }),
          type: 'success'
        })
      )
      .addCase(walletNameStorageFailed, displayError)
      .addCase(csvFileGenerationStarted, (state) =>
        displayMessageImmediately(state, {
          text: i18n.t('Your CSV file is being compiled in the background.'),
          duration: -1
        })
      )
      .addCase(csvFileGenerationFinished, (state) =>
        displayMessageImmediately(state, {
          text: i18n.t('Your CSV file has been generated successfully.'),
          type: 'success'
        })
      )
      .addCase(fetchTransactionsCsv.rejected, (state, action) => {
        const message = action.payload

        if (message) displayMessageImmediately(state, message)
      })
      .addCase(walletConnectPairingFailed, displayError)
      .addCase(walletConnectProposalApprovalFailed, displayError)
  }
})

export default snackbarSlice

// Reducers helper functions

const defaultSnackbarMessageSettings: Required<SnackbarMessage> = {
  text: '',
  type: 'info',
  duration: 3000 // ms
}

const queueMessage = (state: SnackbarSliceState, message: SnackbarMessage) => {
  state.messages.push({ ...defaultSnackbarMessageSettings, ...message })
}

const displayMessageImmediately = (state: SnackbarSliceState, message: SnackbarMessage) => {
  state.messages = [{ ...defaultSnackbarMessageSettings, ...message }]
}

const displayError = (state: SnackbarSliceState, action: PayloadAction<Message>) =>
  displayMessageImmediately(state, { text: action.payload, type: 'alert', duration: 5000 })
