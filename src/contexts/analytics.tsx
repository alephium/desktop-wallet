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

import { PostHogConfig } from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'

import AnalyticsStorage from '@/storage/analytics/analyticsPersistentStorage'
import SettingsStorage from '@/storage/settings/settingsPersistentStorage'
import { GeneralSettings } from '@/types/settings'

const { VITE_PUBLIC_POSTHOG_KEY, VITE_PUBLIC_POSTHOG_HOST } = import.meta.env

const options: Partial<PostHogConfig> = {
  api_host: VITE_PUBLIC_POSTHOG_HOST,
  autocapture: false,
  capture_pageview: false,
  capture_pageleave: false,
  disable_session_recording: true,
  disable_persistence: true,
  disable_cookie: true,
  ip: false,
  loaded(posthog) {
    const { analytics } = SettingsStorage.load('general') as GeneralSettings

    if (analytics && !import.meta.env.DEV) {
      const id = AnalyticsStorage.load()

      posthog.identify(id)
      posthog.opt_in_capturing()
    } else {
      posthog.opt_out_capturing()
    }
  }
}

const AnalyticsProvider: FC = ({ children }) => (
  <PostHogProvider apiKey={VITE_PUBLIC_POSTHOG_KEY} options={options}>
    {children}
  </PostHogProvider>
)

export default AnalyticsProvider
