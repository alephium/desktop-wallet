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

import { motion, useTransform, useViewportScroll } from 'framer-motion'
import { FC } from 'react'
import styled from 'styled-components'

import { deviceBreakPoints } from '../style/globalStyles'

const AppHeader: FC = ({ children }) => {
  const { scrollY } = useViewportScroll()

  const headerBGColor = useTransform(scrollY, [0, 100], ['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 1)'])

  return (
    <HeaderContainer id="app-header" style={{ backgroundColor: headerBGColor }}>
      {children}
    </HeaderContainer>
  )
}

export const HeaderDivider = styled.div`
  width: 1px;
  height: 10px;
  margin: 0 10px;
  background-color: ${({ theme }) => theme.border.primary};
`

const HeaderContainer = styled(motion.header)`
  height: 50px;
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  z-index: 900;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 0 20px;

  > *:not(:last-child) {
    margin-right: 5px;
  }

  @media ${deviceBreakPoints.mobile} {
    background-color: ${({ theme }) => theme.bg.primary};
  }
`

export default AppHeader
