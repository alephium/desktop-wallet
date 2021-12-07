// Copyright 2018 - 2021 The Alephium Authors
// This file is part of the alephium project.
//
// The library is free software: you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// The library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public License
// along with the library. If not, see <http://www.gnu.org/licenses/>.

import { createGlobalStyle } from 'styled-components'

import { isElectron } from '../utils/misc'
import resets from './resets'
import tags from './tags'

export const appHeaderHeight = 'var(--spacing-50)'

const extensionWindowDimensions = `
  height: 600px;
  width: 400px;
`

const electronWindowDimensions = `
  height: 100%;
`

export const GlobalStyle = createGlobalStyle`
  ${resets}

  :root {
    --color-white: #fff;
    --color-orange: #f6c76a;
    --color-grey: #646775;
    --color-purple: #3a0595;
    --color-shadow-15: rgba(0, 0, 0, 0.15);
    --color-shadow-10: rgba(0, 0, 0, 0.1);
    --color-shadow-5: rgba(0, 0, 0, 0.05);

    --shadow: 0 15px 15px var(--color-shadow-15);

    --spacing-3: 3px;
    --spacing-5: 5px;
    --spacing-6: 6px;
    --spacing-7: 7px;
    --spacing-8: 8px;
    --spacing-10: 10px;
    --spacing-12: 12px;
    --spacing-15: 15px;
    --spacing-16: 16px;
    --spacing-20: 20px;
    --spacing-25: 25px;
    --spacing-30: 30px;
    --spacing-40: 40px;
    --spacing-46: 46px;
    --spacing-50: 50px;
    --spacing-60: 60px;
    --spacing-80: 80px;

    --radius-small: 4px;
    --radius: 7px;
    --radius-big: 14px;
    --radius-full: 100%;

    --fontWeight-medium: 500;
    --fontWeight-semiBold: 600;
    --fontWeight-bold: 800;
  }

  html {
    ${isElectron() ? electronWindowDimensions : extensionWindowDimensions}
  }

  body {
    color: ${({ theme }) => theme.font.primary};
    background-color: ${({ theme }) => theme.bg.primary};
  }

  ${tags}
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
