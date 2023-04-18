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

import styled from 'styled-components'

import { ReactComponent as AlephiumLogoSVG } from '@/images/alephium_logo_monochrome.svg'
import { deviceBreakPoints } from '@/style/globalStyles'

export default styled(AlephiumLogoSVG)<{ position?: 'top' | 'bottom' }>`
  position: absolute;
  left: var(--spacing-5);
  width: 35px;
  height: auto;
  ${({ position }) => (position === 'bottom' ? 'bottom: var(--spacing-5)' : 'top: 50px')};

  path {
    fill: ${({ theme }) =>
      (theme.name === 'light' ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.03)') + ' !important'};
  }

  @media ${deviceBreakPoints.mobile} {
    display: none;
  }
`
