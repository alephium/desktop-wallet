import { DefaultTheme } from 'styled-components'
import tinycolor from 'tinycolor2'

export type ThemeType = 'light' | 'dark'

export const lightTheme: DefaultTheme = {
  name: 'light',
  bg: {
    primary: '#ffffff',
    secondary: 'rgba(61, 64, 74, 0.05)',
    tertiary: 'rgba(61, 64, 74, 0.2)',
    hover: 'rgba(61, 64, 74, 0.035)',
    contrast: '#212126',
    accent: tinycolor('#5981f3').setAlpha(0.08).toString()
  },
  font: {
    primary: '#1b202f',
    secondary: '#797979',
    contrastPrimary: 'rgba(255, 255, 255, 1)',
    contrastSecondary: 'rgba(255, 255, 255, 0.8)'
  },
  border: {
    primary: '#ebebeb',
    secondary: '#f5f5f5'
  },
  global: {
    accent: '#5981f3',
    secondary: '#FF5D51',
    alert: '#ed4a34',
    valid: '#4ebf08',
    highlightGradient: 'linear-gradient(45deg, rgba(18,0,218,1) 0%, rgba(255,93,81,1) 100%)'
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
    accent: tinycolor('#5981f3').setAlpha(0.08).toString()
  },
  font: {
    primary: 'rgba(255, 255, 255, 0.8)',
    secondary: 'rgba(255, 255, 255, 0.5)',
    contrastPrimary: 'rgba(0, 0, 0, 1)',
    contrastSecondary: 'rgba(0, 0, 0, 0.8)'
  },
  border: {
    primary: '#34353A',
    secondary: '#27282d'
  },
  global: {
    accent: '#397de3',
    secondary: '#FF5D51',
    alert: '#ed4a34',
    valid: '#4ebf08',
    highlightGradient: 'linear-gradient(45deg, rgba(18,0,218,1) 0%, rgba(255,93,81,1) 100%)'
  }
}
