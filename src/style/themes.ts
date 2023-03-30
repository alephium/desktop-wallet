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

import { colord } from 'colord'
import { DefaultTheme } from 'styled-components'

export const lightTheme: DefaultTheme = {
  name: 'light',
  bg: {
    primary: '#ffffff',
    secondary: '#F9F9F9',
    tertiary: '#f4f4f4',
    contrast: '#212126',
    background1: '#F0F0F0',
    background2: '#f9f9f9',
    accent: colord('#5981f3').alpha(0.15).toHex(),
    hover: 'rgba(0, 0, 0, 0.012)'
  },
  font: {
    primary: '#1d1d1d',
    secondary: '#6a6a6a',
    tertiary: '#adadad',
    contrastPrimary: 'rgba(255, 255, 255, 1)',
    contrastSecondary: 'rgba(255, 255, 255, 0.8)',
    highlight: '#d9a800'
  },
  border: {
    primary: '#e3e3e3',
    secondary: '#e0e0e0'
  },
  shadow: {
    primary: '0 2px 2px rgba(0, 0, 0, 0.03)',
    secondary: '0 10px 10px rgba(0, 0, 0, 0.04)',
    tertiary: '0 0 50px rgba(0, 0, 0, 0.3)'
  },
  global: {
    accent: '#5981f3',
    complementary: '#FF5D51',
    alert: '#ed4a34',
    valid: '#18BB63',
    highlightGradient: 'linear-gradient(45deg, rgba(18,0,218,1) 0%, rgba(255,93,81,1) 100%)'
  }
}

export const darkTheme: DefaultTheme = {
  name: 'dark',
  bg: {
    primary: '#1B1B1F',
    secondary: '#18181B',
    tertiary: '#141417',
    contrast: 'white',
    background1: '#121215',
    background2: '#0E0E10',
    hover: colord('#1B1B1F').lighten(0.02).toHex(),
    accent: colord('#598BED').alpha(0.15).toHex()
  },
  font: {
    primary: '#e3e3e3',
    secondary: '#C0C0C0',
    tertiary: 'rgba(255, 255, 255, 0.4)',
    contrastPrimary: 'rgba(0, 0, 0, 1)',
    contrastSecondary: 'rgba(0, 0, 0, 0.8)',
    highlight: '#f0d590'
  },
  border: {
    primary: 'rgba(255, 255, 255, 0.08)',
    secondary: 'rgba(255, 255, 255, 0.04)'
  },
  shadow: {
    primary: '0 4px 4px rgba(0, 0, 0, 0.25)',
    secondary: '0 10px 10px rgba(0, 0, 0, 0.3)',
    tertiary: '0 0 50px rgb(0, 0, 0)'
  },
  global: {
    accent: '#598BED',
    complementary: '#FF5D51',
    alert: '#ed4a34',
    valid: '#18BB63',
    highlightGradient: 'linear-gradient(45deg, rgba(18,0,218,1) 0%, rgba(255,93,81,1) 100%)'
  }
}
