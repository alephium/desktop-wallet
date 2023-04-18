/*
Copyright 2018 - 2023 The Alephium Authors
This file is part of the alephium project.

The library is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with the library. If not, see <http://www.gnu.org/licenses/>.
*/

import { createGlobalStyle } from 'styled-components'

import resets from '@/style/resets'
import tags from '@/style/tags'
import { isElectron } from '@/utils/misc'

export const appHeaderHeightPx = 60

export const walletSidebarWidthPx = 80

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
    --color-orange: #fab01e;
    --color-grey: #646775;
    --color-purple: #3A0595;

    /* spacial system of 5px linear scale */
    --spacing-1: 5px;
    --spacing-2: 10px;
    --spacing-3: 15px;
    --spacing-4: 20px;
    --spacing-5: 25px;
    --spacing-6: 30px;
    --spacing-7: 35px;
    --spacing-8: 40px;

    --radius-tiny: 4px;
    --radius-small: 7px;
    --radius-medium: 9px;
    --radius-big: 12px;
    --radius-huge: 17px;
    --radius-full: 100%;

    --fontWeight-normal: 400;
    --fontWeight-medium: 500;
    --fontWeight-semiBold: 600;
    --fontWeight-bold: 800;

    --inputHeight: 55px;
    --tableCellHeight: 47px;
    --toggleWidth: 52px;
  }

  html {
    ${isElectron() ? electronWindowDimensions : extensionWindowDimensions}
  }

  body {
    color: ${({ theme }) => theme.font.primary};
    background-color: ${({ theme }) => theme.bg.primary};
  }

  ${tags}

  .skeleton-loader {
    background-image: linear-gradient(-90deg, rgba(0, 0, 0, 0.05), rgba(255, 255, 255, 0.05), rgba(0, 0, 0, 0.05));
    background-size: 400% 400%;
    animation: gradientAnimation 1.5s ease-in-out infinite;

    @keyframes gradientAnimation {
      0% {
        background-position: 0% 0%;
      }
      100% {
        background-position: -135% 0%;
      }
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
  desktop: `(max-width: ${deviceSizes.desktop}px)`,
  short: '(max-height: 600px)'
}
