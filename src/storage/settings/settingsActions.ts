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
import { Language, Settings, ThemeType } from '@/types/settings'
import { SnackbarMessage } from '@/types/snackbar'

export const languageChangeStarted = createAction('settings/languageChangeStarted')

export const languageChangeFinished = createAction('settings/languageChangeFinished')

export const systemLanguageMatchSucceeded = createAction<Language>('settings/systemLanguageMatchSucceeded')

export const systemLanguageMatchFailed = createAction('settings/systemLanguageMatchFailed')

export const themeSettingsChanged = createAction<Settings['general']['theme']>('settings/themeSettingsChanged')

export const themeToggled = createAction<ThemeType>('settings/themeToggled')

export const discreetModeToggled = createAction('settings/discreetModeToggled')

export const passwordRequirementToggled = createAction('settings/passwordRequirementToggled')

export const devToolsToggled = createAction('settings/devToolsToggled')

export const languageChanged = createAction<Settings['general']['language']>('settings/languageChanged')

export const walletLockTimeChanged = createAction<Settings['general']['walletLockTimeInMinutes']>(
  'settings/walletLockTimeChanged'
)

export const analyticsToggled = createAction<Settings['general']['analytics']>('settings/analyticsToggled')

export const fiatCurrencyChanged = createAction<Settings['general']['fiatCurrency']>('settings/fiatCurrencyChanged')

export const receiveTestnetTokens = createAsyncThunk<undefined, AddressHash, { rejectValue: SnackbarMessage }>(
  'assets/receiveTestnetTokens',
  async (destinationAddress: AddressHash, { rejectWithValue }) => {
    const response = await fetch('https://faucet.testnet.alephium.org/send', {
      method: 'POST',
      body: destinationAddress
    })

    if (!response.ok) {
      return rejectWithValue({
        text: i18n.t('Encountered error while calling the faucet. Please try again in a few minutes.'),
        type: 'alert'
      })
    }
  }
)
