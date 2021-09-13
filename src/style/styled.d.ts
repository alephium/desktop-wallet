// import original module declarations
import 'styled-components'
import { ThemeType } from './themes'

// and extend them!
declare module 'styled-components' {
  export interface DefaultTheme {
    name: ThemeType
    bg: {
      primary: string
      secondary: string
      tertiary: string
      contrast: string
      accent: string
    }
    font: {
      primary: string
      secondary: string
      contrastPrimary: string
      contrastSecondary: string
    }
    border: {
      primary: string
      secondary: string
    }
    global: {
      accent: string
      secondary: string
      alert: string
      valid: string
      highlightGradient: string
    }
  }
}
