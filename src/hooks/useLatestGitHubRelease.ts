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

import { compareVersions } from 'compare-versions'
import { usePostHog } from 'posthog-js/react'
import { useState } from 'react'

import { AlephiumWindow } from '@/types/window'
import { AppMetaData, KEY_APPMETADATA, toAppMetaData } from '@/utils/app-data'
import { useTimeout } from '@/utils/hooks'
import { links } from '@/utils/links'

const _window = window as unknown as AlephiumWindow
const electron = _window.electron

const currentVersion = import.meta.env.VITE_VERSION
const semverRegex = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)?$/

const ONE_HOUR = 1000 * 60 * 60

const useLatestGitHubRelease = () => {
  const posthog = usePostHog()

  const [newVersion, setNewVersion] = useState('')
  const [timeUntilNextFetch, setTimeUntilNextFetch] = useState(0)
  const [requiresManualDownload, setRequiresManualDownload] = useState(false)

  const checkForManualDownload = async () => {
    const response = await fetch(links.latestReleaseApi)
    const data = await response.json()
    const version = data.tag_name.replace('v', '')

    if (isVersionNewer(version)) {
      setNewVersion(version)
      setRequiresManualDownload(true)
    }
  }

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

    if (!version) {
      try {
        await checkForManualDownload()
      } catch (e) {
        posthog.capture('Error', { message: 'Checking for latest release version for manual download' })
        console.error(e)
      }
    } else if (isVersionNewer(version)) {
      setNewVersion(version)
    }

    localStorage.setItem(KEY_APPMETADATA, JSON.stringify({ ...appData, lastVersionCheckedAt: new Date() }))
    setTimeUntilNextFetch(nextTimeUntilNextFetch)
  }, timeUntilNextFetch)

  return { newVersion, requiresManualDownload }
}

export default useLatestGitHubRelease

const isVersionNewer = (version: string): boolean =>
  semverRegex.test(version) && currentVersion && compareVersions(version, currentVersion) > 0
