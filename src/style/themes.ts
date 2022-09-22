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

export type ThemeType = 'light' | 'dark'

export const lightTheme: DefaultTheme = {
  name: 'light',
  bg: {
    primary: '#ffffff',
    secondary: '#fbfbfb',
    tertiary: '#ededed',
    hover: 'rgba(61, 64, 74, 0.035)',
    contrast: '#212126',
    accent: colord('#000').alpha(0.08).toRgbString()
  },
  font: {
    primary: '#000',
    secondary: '#797979',
    tertiary: '#adadad',
    contrastPrimary: 'rgba(255, 255, 255, 1)',
    contrastSecondary: 'rgba(255, 255, 255, 0.8)',
    highlight: '#ffb800'
  },
  border: {
    primary: '#ebebeb',
    secondary: '#f1f1f1'
  },
  shadow: {
    primary: '0 2px 2px rgba(0, 0, 0, 0.03)',
    secondary: '0 10px 10px rgba(0, 0, 0, 0.04)',
    tertiary: '0 20px 20px rgba(0, 0, 0, 0.05)'
  },
  global: {
    accent: '#5981f3',
    complementary: '#FF5D51',
    alert: '#ed4a34',
    valid: '#3ed282',
    highlightGradient: 'linear-gradient(45deg, rgba(18,0,218,1) 0%, rgba(255,93,81,1) 100%)'
  }
}

export const darkTheme: DefaultTheme = {
  name: 'dark',
  bg: {
    primary: '#19191E',
    secondary: '#141417',
    tertiary: '#101012',
    hover: 'rgba(61, 64, 74, 0.1)',
    contrast: 'white',
    accent: colord('#101012').alpha(0.32).toRgbString()
  },
  font: {
    primary: 'rgba(255, 255, 255, 0.95)',
    secondary: 'rgba(255, 255, 255, 0.65)',
    tertiary: 'rgba(255, 255, 255, 0.40)',
    contrastPrimary: 'rgba(0, 0, 0, 1)',
    contrastSecondary: 'rgba(0, 0, 0, 0.8)',
    highlight: '#ffb800'
  },
  border: {
    primary: 'rgb(43, 43, 48)',
    secondary: 'rgb(34, 34, 38)'
  },
  shadow: {
    primary: '0 2px 2px rgba(0, 0, 0, 0.25)',
    secondary: '0 10px 10px rgba(0, 0, 0, 0.3)',
    tertiary: '0 25px 25px rgba(0, 0, 0, 0.2)'
  },
  global: {
    accent: '#6083FF',
    complementary: '#FF5D51',
    alert: '#ed4a34',
    valid: '#3ed282',
    highlightGradient: 'linear-gradient(45deg, rgba(18,0,218,1) 0%, rgba(255,93,81,1) 100%)'
  }
}
