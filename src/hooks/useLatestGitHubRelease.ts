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

import { useCallback, useState } from 'react'

import { useGlobalContext } from '../contexts/global'
import { AppData, KEY_APPDATA, toAppData } from '../utils/app-data'
import { useTimeout } from '../utils/hooks'

const currentVersion = process.env.REACT_APP_VERSION
const semverRegex = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)?$/

const ONE_HOUR = 1000 * 60 * 60

const useLatestGitHubRelease = () => {
  const { setSnackbarMessage } = useGlobalContext()

  const [newLatestRelease, setNewLatestRelease] = useState('')
  const [timeUntilNextFetch, setTimeUntilNextFetch] = useState(0)

  const fetchLatestVersion = async () => {
    const response = await fetch('https://api.github.com/repos/alephium/desktop-wallet/releases/latest')
    const data = await response.json()
    const latestVersion = data.tag_name.replace('v', '')

    if (semverRegex.test(latestVersion) && currentVersion !== latestVersion) {
      setNewLatestRelease(latestVersion)
    }
  }

  const tryFetchLatestVersion = useCallback(async () => {
    try {
      await fetchLatestVersion()
    } catch (e) {
      console.error(e)
      setSnackbarMessage({ text: "Couldn't fetch latest wallet version.", type: 'alert' })
    }
  }, [setSnackbarMessage])

  useTimeout(async () => {
    const appData: AppData = JSON.parse(localStorage.getItem(KEY_APPDATA) ?? '{}', toAppData) ?? {}
    const { lastVersionCheckedAt } = appData
    const timeSinceLastCheck = (lastVersionCheckedAt !== undefined && Date.now() - lastVersionCheckedAt.getTime()) || 0
    const nextTimeUntilNextFetch = Math.max(0, ONE_HOUR - timeSinceLastCheck)

    if (timeUntilNextFetch === 0 && nextTimeUntilNextFetch !== 0) {
      setTimeUntilNextFetch(nextTimeUntilNextFetch)
      return
    }

    await tryFetchLatestVersion()
    localStorage.setItem(KEY_APPDATA, JSON.stringify({ ...appData, lastVersionCheckedAt: new Date() }))
    setTimeUntilNextFetch(nextTimeUntilNextFetch)
  }, timeUntilNextFetch)

  return newLatestRelease
}

export default useLatestGitHubRelease
