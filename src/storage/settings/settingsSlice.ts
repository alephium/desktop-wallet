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

import 'dayjs/locale/fr'
import 'dayjs/locale/de'
import 'dayjs/locale/vi'
import 'dayjs/locale/pt'
import 'dayjs/locale/ru'

import { createListenerMiddleware, createSlice, isAnyOf } from '@reduxjs/toolkit'
import dayjs from 'dayjs'

import i18next from '@/i18n'
import { localStorageDataMigrated } from '@/storage/global/globalActions'
import {
  analyticsToggled,
  devToolsToggled,
  discreetModeToggled,
  fiatCurrencyChanged,
  languageChanged,
  languageChangeFinished,
  languageChangeStarted,
  passwordRequirementToggled,
  receiveTestnetTokens,
  systemLanguageMatchFailed,
  systemLanguageMatchSucceeded,
  themeSettingsChanged,
  themeToggled,
  walletLockTimeChanged
} from '@/storage/settings/settingsActions'
import SettingsStorage from '@/storage/settings/settingsPersistentStorage'
import { RootState } from '@/storage/store'
import { GeneralSettings } from '@/types/settings'

interface SettingsState extends GeneralSettings {
  faucetCallPending: boolean
}

const initialState: SettingsState = {
  ...(SettingsStorage.load('general') as GeneralSettings),
  faucetCallPending: false
}

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(localStorageDataMigrated, () => SettingsStorage.load('general') as SettingsState)
      .addCase(systemLanguageMatchSucceeded, (state, { payload: language }) => {
        state.language = language
      })
      .addCase(systemLanguageMatchFailed, (state) => {
        state.language = 'en-US'
      })
      .addCase(themeSettingsChanged, (state, action) => {
        state.theme = action.payload
      })
      .addCase(themeToggled, (state, action) => {
        state.theme = action.payload
      })
      .addCase(discreetModeToggled, (state) => {
        state.discreetMode = !state.discreetMode
      })
      .addCase(passwordRequirementToggled, (state) => {
        state.passwordRequirement = !state.passwordRequirement
      })
      .addCase(devToolsToggled, (state) => {
        state.devTools = !state.devTools
      })
      .addCase(languageChanged, (state, action) => {
        state.language = action.payload
      })
      .addCase(walletLockTimeChanged, (state, action) => {
        state.walletLockTimeInMinutes = action.payload
      })
      .addCase(analyticsToggled, (state, action) => {
        state.analytics = action.payload
      })
      .addCase(fiatCurrencyChanged, (state, action) => {
        state.fiatCurrency = action.payload
      })
      .addCase(receiveTestnetTokens.pending, (state) => {
        state.faucetCallPending = true
      })
      .addCase(receiveTestnetTokens.fulfilled, (state) => {
        state.faucetCallPending = false
      })
      .addCase(receiveTestnetTokens.rejected, (state) => {
        state.faucetCallPending = false
      })
  }
})

export const settingsListenerMiddleware = createListenerMiddleware()

// When the settings change, store them in persistent storage
settingsListenerMiddleware.startListening({
  matcher: isAnyOf(
    themeSettingsChanged,
    themeToggled,
    discreetModeToggled,
    passwordRequirementToggled,
    devToolsToggled,
    languageChanged,
    systemLanguageMatchSucceeded,
    systemLanguageMatchFailed,
    walletLockTimeChanged,
    analyticsToggled,
    fiatCurrencyChanged
  ),
  effect: (_, { getState }) => {
    const state = getState() as RootState

    SettingsStorage.store('general', state.settings)
  }
})

settingsListenerMiddleware.startListening({
  matcher: isAnyOf(localStorageDataMigrated, languageChanged, systemLanguageMatchSucceeded, systemLanguageMatchFailed),
  effect: async (_, { getState, dispatch }) => {
    const state = getState() as RootState

    const settings = state.settings

    const handleLanguageChange = async () => {
      if (!settings.language) return

      dispatch(languageChangeStarted())

      try {
        dayjs.locale(settings.language.slice(0, 2))
        await i18next.changeLanguage(settings.language)
      } catch (e) {
        console.error(e)
      } finally {
        dispatch(languageChangeFinished())
      }
    }

    if (settings.language && i18next.language !== settings.language) {
      handleLanguageChange()
    }
  }
})

export default settingsSlice
