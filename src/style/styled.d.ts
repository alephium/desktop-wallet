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
    }
    font: {
      primary: string
      secondary: string
      contrast: string
    }
    border: {
      primary: string
    }
    global: {
      accent: string
      alert: string
    }
  }
}
