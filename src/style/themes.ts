import { DefaultTheme } from 'styled-components'
import tinycolor from 'tinycolor2'

export const lightTheme: DefaultTheme = {
  name: 'light',
  bg: {
    primary: '#ffffff',
    secondary: 'rgba(61, 64, 74, 0.05)',
    tertiary: 'rgba(61, 64, 74, 0.2)',
    hover: 'rgba(61, 64, 74, 0.035)',
    contrast: '#09122d',
    accent: tinycolor('#5981f3').setAlpha(0.08).toString()
  },
  font: {
    primary: '#1b202f',
    secondary: '#797979',
    contrastPrimary: 'rgba(255, 255, 255, 1)',
    contrastSecondary: 'rgba(255, 255, 255, 0.85)'
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
