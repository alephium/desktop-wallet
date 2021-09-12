import { DefaultTheme } from 'styled-components'

export const lightTheme: DefaultTheme = {
  name: 'light',
  bg: {
    primary: '#ffffff',
    secondary: 'rgba(61, 64, 74, 0.05)',
    tertiary: 'rgba(61, 64, 74, 0.2)',
    contrast: '#111c3e'
  },
  font: {
    primary: '#1b202f',
    secondary: '#797979',
    contrastPrimary: 'rgba(255, 255, 255, 1)',
    contrastSecondary: 'rgba(255, 255, 255, 0.85)'
  },
  border: {
    primary: '#E8E8E8'
  },
  global: {
    accent: '#3C90F1',
    secondary: '#FFC73B',
    alert: '#ed4a34',
    valid: '#4ACF34'
  }
}
