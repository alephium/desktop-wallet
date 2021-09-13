import { DefaultTheme } from 'styled-components'
import tinycolor from 'tinycolor2'

export const lightTheme: DefaultTheme = {
  name: 'light',
  bg: {
    primary: '#ffffff',
    secondary: 'rgba(61, 64, 74, 0.05)',
    tertiary: 'rgba(61, 64, 74, 0.2)',
    contrast: '#111c3e',
    accent: tinycolor('#1f7fed').setAlpha(0.08).toString()
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
    accent: '#1f7fed',
    secondary: '#FFC73B',
    alert: '#ed4a34',
    valid: '#4ebf08'
  }
}
