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

/* eslint-disable @typescript-eslint/no-explicit-any */

import { Error, ProgressInfo, UpdateDownloadedEvent } from 'electron-updater'

interface NativeTheme {
  shouldUseDarkColors: boolean
  themeSource: string
}

export interface AlephiumWindow extends Window {
  electron?: {
    theme: {
      setNativeTheme: (theme: string) => void
      getNativeTheme: () => void
      onGetNativeTheme: (cb: (nativeTheme: NativeTheme) => void) => () => void
    }
    updater: {
      checkForUpdates: () => Promise<string>
      startUpdateDownload: () => void
      onUpdateDownloadProgress: (callback: (event: any, info: ProgressInfo) => void) => () => void
      onUpdateDownloaded: (callback: (event: any, updateDownloadedEvent: UpdateDownloadedEvent) => void) => () => void
      quitAndInstallUpdate: () => void
      onError: (callback: (event: any, error: Error) => void) => () => void
    }
  }
}
