import { createGlobalStyle } from 'styled-components'
import { isElectron } from '../utils/misc'

// Extension: define window size
const limitedSize = `
  height: 600px;
  width: 400px;
`

const freeSize = `
  height: 100%;
`

export const appHeaderHeight = '50px'

export const GlobalStyle = createGlobalStyle`
  html {
    ${!isElectron() ? limitedSize : freeSize}
  }

  body {
    color: ${({ theme }) => theme.font.primary};
    background-color: ${({ theme }) => theme.bg.primary};
  }

  // Text area tags dropdown
  .tagify__tag__removeBtn {
    display: none;
  }

  .tagify__input::before {
    line-height: 22px;
  }

  .tags-dropdown {
    position: fixed;
    bottom: 10px !important;
    left: 10px !important;
    right: 10px !important;
    width: auto !important;
    top: auto !important;
    margin: 0;

    .tagify__dropdown__wrapper {
      border: none;
      border-radius: 7px;
      background-color: ${({ theme }) => theme.bg.contrast};
    }

    .tagify__dropdown__item  {
      color: ${({ theme }) => theme.font.contrastPrimary};
      margin: 0;
      border-radius: 0;
      padding: 10px;

      &:not(:last-child) {
        border-bottom: 1px solid ${({ theme }) => theme.border};
      }
    }

    .tagify__dropdown__item--active {
      background-color: ${({ theme }) => theme.global.accent};
    }
  }
`

// Breakpoints

export const deviceSizes = {
  mobile: 800,
  tablet: 1000,
  desktop: 1600
}

export const deviceBreakPoints = {
  mobile: `(max-width: ${deviceSizes.mobile}px)`,
  tablet: `(max-width: ${deviceSizes.tablet}px)`,
  desktop: `(min-width: ${deviceSizes.desktop}px)`,
  short: '(max-height: 600px)'
}
