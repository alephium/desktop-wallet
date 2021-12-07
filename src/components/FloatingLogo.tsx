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

import styled from 'styled-components'

import { deviceBreakPoints } from '../style/globalStyles'

import { ReactComponent as AlephiumLogoSVG } from '../images/alephium_logo_monochrome.svg'

const FloatingLogo = styled(AlephiumLogoSVG)`
  position: absolute;
  top: var(--spacing-50);
  left: var(--spacing-25);
  width: var(--spacing-60);
  height: var(--spacing-60);

  path {
    fill: var(--color-shadow-5) !important;
  }

  @media ${deviceBreakPoints.mobile} {
    display: none;
  }
`

export default FloatingLogo
