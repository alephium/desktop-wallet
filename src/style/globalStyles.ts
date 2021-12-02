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

export const appHeaderHeight = '50px'

const extensionWindowDimensions = `
  height: 600px;
  width: 400px;
`

const electronWindowDimensions = `
  height: 100%;
`

export const GlobalStyle = createGlobalStyle`
  ${resets}

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
