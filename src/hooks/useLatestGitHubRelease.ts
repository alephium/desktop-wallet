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

import { useEffect, useState } from 'react'

import { AppData, KEY_APPDATA, toAppData } from '../utils/app-data'

const currentVersion = process.env.REACT_APP_VERSION
const semverRegex = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)?$/

const ONE_HOUR = 1000 * 60 * 60

const useLatestGitHubRelease = () => {
  const [newLatestRelease, setNewLatestRelease] = useState('')
  const { lastVersionCheckedAt }: AppData = JSON.parse(localStorage.getItem(KEY_APPDATA) ?? '{}', toAppData) ?? {}

  const fetchLatestVersion = async () => {
    const response = await fetch('https://api.github.com/repos/alephium/desktop-wallet/releases/latest')
    const data = await response.json()
    const latestVersion = data.tag_name.replace('v', '')

    if (semverRegex.test(latestVersion) && currentVersion !== latestVersion) {
      setNewLatestRelease(latestVersion)
    }
  }

  useEffect(() => {
    if (lastVersionCheckedAt !== undefined && Date.now() - lastVersionCheckedAt.getTime() < ONE_HOUR) {
      return
    }

    localStorage.setItem(KEY_APPDATA, JSON.stringify({ lastVersionCheckedAt: new Date() }))

    fetchLatestVersion()
  })

  return newLatestRelease
}

export default useLatestGitHubRelease
