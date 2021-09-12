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

export const GlobalStyle = createGlobalStyle`
  html {
    font-size: 13px;
    ${!isElectron() ? limitedSize : freeSize}
  }

  body {
    font-size: inherit;
    margin: 0;
    font-family: "Inter", sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: ${({ theme }) => theme.font.primary};
    background-color: ${({ theme }) => theme.bg.primary};
    overflow-y:auto;
    height: 100%;
    width: 100%;
    font-weight: 400;
  }

  #root {
    height: 100%;
  }

  * {
    box-sizing: border-box;
  }

  h1 {
    font-size: 2.2rem;
    margin-bottom: 40px;
    margin-top: 30px;
  }

  h3 {
    font-size: 1.2rem;
  }

	input, button {
		outline: none;
    border: none;
    background: transparent;
	}

  a {
    text-decoration: none;
    color: inherit;
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
      color: ${({ theme }) => theme.font.contrast};
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
  desktop: `(max-width: ${deviceSizes.desktop}px)`
}
