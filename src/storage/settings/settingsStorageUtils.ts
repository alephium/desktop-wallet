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

import { themeSettingsChanged, themeToggled } from '@/storage/settings/settingsActions'
import { store } from '@/storage/store'
import { ThemeSettings, ThemeType } from '@/types/settings'
import { AlephiumWindow } from '@/types/window'

const _window = window as unknown as AlephiumWindow
const electron = _window.electron

export const switchTheme = (theme: ThemeSettings) => {
  electron?.theme.setNativeTheme(theme)
  store.dispatch(themeSettingsChanged(theme))
}

export const toggleTheme = (theme: ThemeType) => {
  electron?.theme.setNativeTheme(theme)
  store.dispatch(themeToggled(theme))
}
