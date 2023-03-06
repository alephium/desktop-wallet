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

import 'dayjs/locale/fr'
import 'dayjs/locale/de'
import 'dayjs/locale/vi'

import { createListenerMiddleware, createSlice, isAnyOf, PayloadAction } from '@reduxjs/toolkit'
import dayjs from 'dayjs'

import i18next from '@/i18n'
import { languageChangeFinished, languageChangeStarted } from '@/storage/app-state/actions'
import { RootState } from '@/storage/app-state/store'
import SettingsStorage from '@/storage/persistent-storage/settingsPersistentStorage'
import { GeneralSettings, Settings } from '@/types/settings'

const sliceName = 'settings'

const initialState: GeneralSettings = SettingsStorage.load('general') as GeneralSettings

const settingsSlice = createSlice({
  name: sliceName,
  initialState,
  reducers: {
    themeSettingsChanged: (state, action: PayloadAction<Settings['general']['theme']>) => {
      state.theme = action.payload
    },
    discreetModeToggled: (state) => {
      state.discreetMode = !state.discreetMode
    },
    passwordRequirementToggled: (state) => {
      state.passwordRequirement = !state.passwordRequirement
    },
    devToolsToggled: (state) => {
      state.devTools = !state.devTools
    },
    languageChanged: (state, action: PayloadAction<Settings['general']['language']>) => {
      state.language = action.payload
    },
    walletLockTimeChanged: (state, action: PayloadAction<Settings['general']['walletLockTimeInMinutes']>) => {
      state.walletLockTimeInMinutes = action.payload
    },
    generalSettingsMigrated: (_, action: PayloadAction<GeneralSettings>) => action.payload
  }
})

export const {
  generalSettingsMigrated,
  themeSettingsChanged,
  discreetModeToggled,
  passwordRequirementToggled,
  devToolsToggled,
  languageChanged,
  walletLockTimeChanged
} = settingsSlice.actions

export const settingsListenerMiddleware = createListenerMiddleware()

// When the settings change, store them in persistent storage
settingsListenerMiddleware.startListening({
  matcher: isAnyOf(
    themeSettingsChanged,
    discreetModeToggled,
    passwordRequirementToggled,
    devToolsToggled,
    languageChanged,
    walletLockTimeChanged
  ),
  effect: (_, { getState }) => {
    const state = getState() as RootState

    SettingsStorage.store('general', state[sliceName])
  }
})

settingsListenerMiddleware.startListening({
  matcher: isAnyOf(generalSettingsMigrated, languageChanged),
  effect: async (_, { getState, dispatch }) => {
    const state = getState() as RootState

    const settings = state[sliceName]

    const handleLanguageChange = async () => {
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

    if (i18next.language !== settings.language) {
      handleLanguageChange()
    }
  }
})

export default settingsSlice
