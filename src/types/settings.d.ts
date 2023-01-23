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

import 'styled-components'

export interface Settings {
  general: {
    theme: ThemeType
    walletLockTimeInMinutes: number | null
    discreetMode: boolean
    passwordRequirement: boolean
    language: Language
    devTools: boolean
  }
  network: {
    networkId: number
    nodeHost: string
    explorerApiHost: string
    explorerUrl: string
  }
}

export enum NetworkNames {
  mainnet,
  testnet,
  localhost,
  custom
}

export type NetworkName = keyof typeof NetworkNames

export type Language = 'en-US' | 'fr-FR' | 'de-DE' | 'vi-VN'

export type ThemeType = 'light' | 'dark' | 'system'

declare module 'styled-components' {
  export interface DefaultTheme {
    name: ThemeType
    bg: {
      primary: string
      secondary: string
      tertiary: string
      hover: string
      contrast: string
      accent: string
      background1: string
      background2: string
    }
    font: {
      primary: string
      secondary: string
      tertiary: string
      contrastPrimary: string
      contrastSecondary: string
      highlight: string
    }
    shadow: {
      primary: string
      secondary: string
      tertiary: string
    }
    border: {
      primary: string
      secondary: string
    }
    global: {
      accent: string
      complementary: string
      alert: string
      valid: string
      highlightGradient: string
    }
  }
}

export type Currency = 'CHF' | 'GBP' | 'EUR' | 'USD'
