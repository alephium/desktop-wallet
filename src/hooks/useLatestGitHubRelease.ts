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

import { compareVersions } from 'compare-versions'
import { useState } from 'react'

import { AlephiumWindow } from '../types/window'
import { AppMetaData, KEY_APPMETADATA, toAppMetaData } from '../utils/app-data'
import { useTimeout } from '../utils/hooks'

const _window = window as unknown as AlephiumWindow
const electron = _window.electron

const currentVersion = import.meta.env.VITE_VERSION
const semverRegex = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)?$/

const ONE_HOUR = 1000 * 60 * 60

const useLatestGitHubRelease = () => {
  const [newLatestRelease, setNewLatestRelease] = useState('')
  const [timeUntilNextFetch, setTimeUntilNextFetch] = useState(0)

  useTimeout(async () => {
    const appData: AppMetaData = JSON.parse(localStorage.getItem(KEY_APPMETADATA) ?? '{}', toAppMetaData) ?? {}
    const { lastVersionCheckedAt } = appData
    // Uncomment to test updater every time the app launches
    // const lastVersionCheckedAt = new Date(0)
    const timeSinceLastCheck = (lastVersionCheckedAt !== undefined && Date.now() - lastVersionCheckedAt.getTime()) || 0
    const nextTimeUntilNextFetch = Math.max(0, ONE_HOUR - timeSinceLastCheck)

    if (timeUntilNextFetch === 0 && nextTimeUntilNextFetch !== 0 && lastVersionCheckedAt !== undefined) {
      setTimeUntilNextFetch(nextTimeUntilNextFetch)
      return
    }

    const version = await electron?.updater.checkForUpdates()

    if (version && semverRegex.test(version) && currentVersion && compareVersions(version, currentVersion) > 0) {
      setNewLatestRelease(version)
    }

    localStorage.setItem(KEY_APPMETADATA, JSON.stringify({ ...appData, lastVersionCheckedAt: new Date() }))
    setTimeUntilNextFetch(nextTimeUntilNextFetch)
  }, timeUntilNextFetch)

  return newLatestRelease
}

export default useLatestGitHubRelease
