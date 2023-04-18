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

import { createAction } from '@reduxjs/toolkit'

import { ThemeType } from '@/types/settings'
import { OptionalMessage } from '@/types/snackbar'

type ModalId = string

export const copiedToClipboard = createAction<OptionalMessage>('app/copiedToClipboard')

export const copyToClipboardFailed = createAction<OptionalMessage>('app/copyToClipboardFailed')

export const localStorageDataMigrated = createAction('app/localStorageDataMigrated')

export const modalOpened = createAction<ModalId>('app/modalOpened')

export const modalClosed = createAction('app/modalClosed')

export const addressesPageInfoMessageClosed = createAction('app/addressesPageInfoMessageClosed')

export const transfersPageInfoMessageClosed = createAction('app/transfersPageInfoMessageClosed')

export const osThemeChangeDetected = createAction<ThemeType>('app/osThemeChangeDetected')

export const devModeShortcutDetected = createAction<{ activate: boolean }>('app/devModeShortcutDetected')

export const snackbarDisplayTimeExpired = createAction('app/snackbarDisplayTimeExpired')
