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

import { SelectOption } from '@/components/Inputs/Select'
import { networkPresets } from '@/storage/settings/settingsPersistentStorage'
import SettingsStorage from '@/storage/settings/settingsPersistentStorage'
import { NetworkName } from '@/types/network'
import { Currency, GeneralSettings, Language, NetworkSettings } from '@/types/settings'

export const isEqualNetwork = (a: NetworkSettings, b: NetworkSettings): boolean =>
  a.nodeHost === b.nodeHost && a.explorerUrl === b.explorerUrl && a.explorerApiHost === b.explorerApiHost

export const getNetworkName = (settings: NetworkSettings) =>
  (Object.entries(networkPresets).find(([, presetSettings]) => isEqualNetwork(presetSettings, settings))?.[0] ||
    'custom') as NetworkName | 'custom'

export const languageOptions: SelectOption<Language>[] = [
  { label: 'English', value: 'en-US' },
  { label: 'Български', value: 'bg-BG' },
  { label: 'Deutsch', value: 'de-DE' },
  { label: 'Español', value: 'es-ES' },
  { label: 'Français', value: 'fr-FR' },
  { label: 'Bahasa Indonesia', value: 'id-ID' },
  { label: 'Português', value: 'pt-PT' },
  { label: 'Русский', value: 'ru-RU' },
  { label: 'Türkçe', value: 'tr-TR' },
  { label: 'Tiếng Việt', value: 'vi-VN' }
]

export const fiatCurrencyOptions: SelectOption<Currency>[] = [
  { label: 'CHF', value: 'CHF' },
  { label: 'EUR', value: 'EUR' },
  { label: 'GBP', value: 'GBP' },
  { label: 'USD', value: 'USD' }
]

export const locktimeInMinutes = [0, 2, 5, 10, 30]

export const getThemeType = () => {
  const storedSettings = SettingsStorage.load('general') as GeneralSettings

  return storedSettings.theme === 'system' ? 'dark' : storedSettings.theme
}
