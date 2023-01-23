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

import SettingsStorage, { defaultSettings } from '../persistent-storage/settings'
import { Settings } from '../types/settings'
import { languageChangeFinished, languageChangeStarted } from './actions'
import { RootState } from './store'

const sliceName = 'settings'

const initialState: Settings = defaultSettings

const settingsSlice = createSlice({
  name: sliceName,
  initialState,
  reducers: {
    themeChanged: (state, action: PayloadAction<Settings['general']['theme']>) => {
      state.general.theme = action.payload
    },
    discreetModeToggled: (state) => {
      state.general.discreetMode = !state.general.discreetMode
    },
    passwordRequirementToggled: (state) => {
      state.general.passwordRequirement = !state.general.passwordRequirement
    },
    devToolsToggled: (state) => {
      state.general.devTools = !state.general.devTools
    },
    languageChanged: (state, action: PayloadAction<Settings['general']['language']>) => {
      state.general.language = action.payload
    },
    walletLockTimeChanged: (state, action: PayloadAction<Settings['general']['walletLockTimeInMinutes']>) => {
      state.general.walletLockTimeInMinutes = action.payload
    },
    settingsLoaded: (_, action: PayloadAction<Settings>) => action.payload
  }
})

export const {
  settingsLoaded,
  themeChanged,
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
    themeChanged,
    discreetModeToggled,
    passwordRequirementToggled,
    devToolsToggled,
    languageChanged,
    walletLockTimeChanged
  ),
  effect: async (_, { getState }) => {
    const state = getState() as RootState

    SettingsStorage.storeAll(state[sliceName])
  }
})

settingsListenerMiddleware.startListening({
  matcher: isAnyOf(settingsLoaded, languageChanged),
  effect: async (_, { getState, dispatch }) => {
    const state = getState() as RootState

    const settings = state[sliceName]

    const handleLanguageChange = async () => {
      dispatch(languageChangeStarted())

      try {
        dayjs.locale(settings.general.language.slice(0, 2))
        await i18next.changeLanguage(settings.general.language)
      } catch (e) {
        console.error(e)
      } finally {
        dispatch(languageChangeFinished())
      }
    }

    if (i18next.language !== settings.general.language) {
      handleLanguageChange()
    }
  }
})

export default settingsSlice
