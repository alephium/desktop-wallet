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

import { networkPresets } from '@/storage/settings/settingsPersistentStorage'
import SettingsStorage from '@/storage/settings/settingsPersistentStorage'
import { NetworkName } from '@/types/network'
import { GeneralSettings, Language, NetworkSettings } from '@/types/settings'

export const isEqualNetwork = (a: NetworkSettings, b: NetworkSettings): boolean =>
  a.nodeHost === b.nodeHost && a.explorerUrl === b.explorerUrl && a.explorerApiHost === b.explorerApiHost

export const getNetworkName = (settings: NetworkSettings) =>
  (Object.entries(networkPresets).find(([, presetSettings]) => isEqualNetwork(presetSettings, settings))?.[0] ||
    'custom') as NetworkName | 'custom'

export const getAvailableLanguageOptions = () => [
  { label: 'Deutsch', value: 'de-DE' as Language },
  { label: 'English', value: 'en-US' as Language },
  { label: 'Español', value: 'es-ES' as Language },
  { label: 'Français', value: 'fr-FR' as Language },
  { label: 'Bahasa Indonesia', value: 'id-ID' as Language },
  { label: 'Português', value: 'pt-PT' as Language },
  { label: 'Русский', value: 'ru-RU' as Language },
  { label: 'Türkçe', value: 'tr-TR' as Language },
  { label: 'Tiếng Việt', value: 'vi-VN' as Language }
]

export const getThemeType = () => {
  const storedSettings = SettingsStorage.load('general') as GeneralSettings

  return storedSettings.theme === 'system' ? 'dark' : storedSettings.theme
}
