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

import { colord } from 'colord'
import { DefaultTheme } from 'styled-components'

export const lightTheme: DefaultTheme = {
  name: 'light',
  bg: {
    primary: '#ffffff',
    secondary: '#fbfbfb',
    tertiary: '#f9f9f9',
    contrast: '#212126',
    background1: '#f7f7f7',
    background2: '#f0f0f0',
    accent: colord('#598bed').alpha(0.05).toHex(),
    hover: colord('#ffffff').darken(0.015).toHex()
  },
  font: {
    primary: '#1d1d1d',
    secondary: '#6a6a6a',
    tertiary: '#989898',
    contrastPrimary: 'rgba(255, 255, 255, 1)',
    contrastSecondary: 'rgba(255, 255, 255, 0.8)',
    highlight: '#d4a10d'
  },
  border: {
    primary: '#e7e7e7',
    secondary: '#f0f0f0'
  },
  shadow: {
    primary: '0 1px 1px rgba(0, 0, 0, 0.03)',
    secondary: '0 8px 10px rgba(0, 0, 0, 0.1)',
    tertiary: '0 0 50px rgba(0, 0, 0, 0.15)'
  },
  global: {
    accent: '#598bed',
    complementary: '#b07dcb',
    alert: '#e53b24',
    valid: '#19b660',
    highlight: '#d4a10d',
    highlightGradient: 'linear-gradient(45deg, rgba(18,0,218,1) 0%, rgba(255,93,81,1) 100%)'
  }
}

export const darkTheme: DefaultTheme = {
  name: 'dark',
  bg: {
    primary: '#18181a',
    secondary: '#161618',
    tertiary: '#141416',
    contrast: 'white',
    background1: '#121214',
    background2: '#0e0e10',
    hover: colord('#18181a').lighten(0.02).toHex(),
    accent: colord('#598bed').alpha(0.07).toHex()
  },
  font: {
    primary: '#e3e3e3',
    secondary: '#c0c0c0',
    tertiary: 'rgba(255, 255, 255, 0.4)',
    contrastPrimary: 'rgba(0, 0, 0, 1)',
    contrastSecondary: 'rgba(0, 0, 0, 0.8)',
    highlight: '#f0d590'
  },
  border: {
    primary: '#232325',
    secondary: '#202022'
  },
  shadow: {
    primary: '0 2px 3px rgba(0, 0, 0, 0.3)',
    secondary: '0 10px 10px rgba(0, 0, 0, 0.25)',
    tertiary: '0 0 50px rgb(0, 0, 0)'
  },
  global: {
    accent: '#598bed',
    complementary: '#d488eb',
    alert: '#ed4a34',
    valid: '#3ed282',
    highlight: '#f0d590',
    highlightGradient: 'linear-gradient(45deg, rgba(18,0,218,1) 0%, rgba(255,93,81,1) 100%)'
  }
}
