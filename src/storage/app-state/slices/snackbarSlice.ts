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

import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { SnackbarMessage } from '@/components/SnackbarManager'
import i18n from '@/i18n'
import {
  copiedToClipboard,
  ErrorMessage,
  passwordValidationFailed,
  transactionBuildFailed,
  transactionSendFailed,
  transactionsSendSucceeded,
  walletCreationFailed
} from '@/storage/app-state/actions'
import { syncAddressesData } from '@/storage/app-state/slices/addressesSlice'
import { contactStorageFailed, contactStoredInPersistentStorage } from '@/storage/app-state/slices/contactsSlice'
import {
  apiClientInitFailed,
  apiClientInitSucceeded,
  customNetworkSettingsSaved
} from '@/storage/app-state/slices/networkSlice'

const sliceName = 'snackbarSlice'

interface SnackbarSliceState {
  messages: SnackbarMessage[]
  offlineMessageWasVisibleOnce: boolean
}

const initialState: SnackbarSliceState = {
  messages: [],
  offlineMessageWasVisibleOnce: false
}

const snackbarSlice = createSlice({
  name: sliceName,
  initialState,
  reducers: {
    snackbarDisplayTimeExpired: (state) => {
      if (state.messages.length > 0) state.messages.shift()
    }
  },
  extraReducers(builder) {
    builder
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
      .addCase(copiedToClipboard, (state) => displayMessageImmediately(state, { text: i18n.t('Copied to clipboard!') }))
      .addCase(passwordValidationFailed, (state) =>
        displayMessageImmediately(state, { text: i18n.t('Invalid password'), type: 'alert' })
      )
  }
})

export const { snackbarDisplayTimeExpired } = snackbarSlice.actions

export default snackbarSlice

const defaultSnackbarMessageSettings: SnackbarMessage = {
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

const displayError = (state: SnackbarSliceState, action: PayloadAction<ErrorMessage>) =>
  displayMessageImmediately(state, { text: action.payload, type: 'alert', duration: 5000 })
