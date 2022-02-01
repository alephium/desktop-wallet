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

import { DefaultTheme } from 'styled-components'
import tinycolor from 'tinycolor2'

export type ThemeType = 'light' | 'dark'

export const lightTheme: DefaultTheme = {
  name: 'light',
  bg: {
    primary: '#ffffff',
    secondary: 'rgba(61, 64, 74, 0.04)',
    tertiary: 'rgba(61, 64, 74, 0.15)',
    hover: 'rgba(61, 64, 74, 0.035)',
    contrast: '#212126',
    accent: tinycolor('#5981f3').setAlpha(0.2).toString()
  },
  font: {
    primary: '#000',
    secondary: '#797979',
    contrastPrimary: 'rgba(255, 255, 255, 1)',
    contrastSecondary: 'rgba(255, 255, 255, 0.8)',
    highlight: '#ffb800'
  },
  border: {
    primary: 'rgba(0, 0, 0, 0.05)',
    secondary: 'rgba(0, 0, 0, 0.02)'
  },
  global: {
    accent: '#5981f3',
    complementary: '#FF5D51',
    alert: '#ed4a34',
    valid: '#4ebf08',
    highlightGradient: 'linear-gradient(45deg, rgba(18,0,218,1) 0%, rgba(255,93,81,1) 100%)'
  },
  badge: {
    font: {
      plus: '#37c461',
      minus: 'rgba(243, 113, 93, 1)',
      neutral: 'rgba(255, 255, 255, 1)',
      neutralHighlight: 'rgba(255, 255, 255, 1)'
    },
    bg: {
      plus: 'rgba(48, 167, 84, 0.12)',
      minus: 'rgba(243, 113, 93, 0.1)',
      neutral: 'rgba(90, 90, 90, 0.6)',
      neutralHighlight: 'rgba(101, 16, 247, 1)'
    }
  }
}

export const darkTheme: DefaultTheme = {
  name: 'dark',
  bg: {
    primary: '#1b1b1f',
    secondary: '#141417',
    tertiary: 'rgba(61, 64, 74, 0.2)',
    hover: 'rgba(61, 64, 74, 0.1)',
    contrast: 'white',
    accent: tinycolor('#6083FF').setAlpha(0.3).toString()
  },
  font: {
    primary: 'rgba(255, 255, 255, 0.95)',
    secondary: 'rgba(255, 255, 255, 0.65)',
    contrastPrimary: 'rgba(0, 0, 0, 1)',
    contrastSecondary: 'rgba(0, 0, 0, 0.8)',
    highlight: '#ffb800'
  },
  border: {
    primary: '#34353A',
    secondary: '#27282d'
  },
  global: {
    accent: '#6083FF',
    complementary: '#FF5D51',
    alert: '#ed4a34',
    valid: '#4ebf08',
    highlightGradient: 'linear-gradient(45deg, rgba(18,0,218,1) 0%, rgba(255,93,81,1) 100%)'
  },
  badge: {
    font: {
      plus: '#37c461',
      minus: 'rgba(243, 113, 93, 1)',
      neutral: 'rgba(255, 255, 255, 0.8)',
      neutralHighlight: 'rgba(255, 255, 255, 1)'
    },
    bg: {
      plus: 'rgba(48, 167, 84, 0.12)',
      minus: 'rgba(243, 113, 93, 0.1)',
      neutral: 'rgba(58, 58, 58, 0.28)',
      neutralHighlight: 'rgba(101, 16, 247, 1)'
    }
  }
}
