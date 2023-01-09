/*
Copyright 2018 - 2022 The Alephium Authors
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
import { motion } from 'framer-motion'
import { ReactNode } from 'react'
import styled from 'styled-components'

import { fadeInOutBottomFast } from '@/animations'
import ModalContainer from '@/modals/ModalContainer'

interface PopupProps {
  onBackgroundClick: () => void
  children?: ReactNode | ReactNode[]
  title?: string
}

const Popup = ({ children, onBackgroundClick, title }: PopupProps) => (
  <ModalContainer onClose={onBackgroundClick}>
    <Content onClick={(e) => e.stopPropagation()} role="dialog" {...fadeInOutBottomFast}>
      {title && (
        <Header>
          <h2>{title}</h2>
        </Header>
      )}
      {children}
    </Content>
  </ModalContainer>
)

export default Popup

const Content = styled(motion.div)`
  position: relative;
  overflow-x: hidden;
  overflow-y: auto;

  width: 30vw;
  min-width: 300px;
  max-height: 500px;
  margin: auto;

  border-radius: var(--radius);
  background-color: ${({ theme }) => theme.bg.primary};
`

const Header = styled.div`
  padding: var(--spacing-1) var(--spacing-3);
  border-bottom: 1px solid ${({ theme }) => theme.border.primary};
  background-color: ${({ theme }) => theme.bg.secondary};
  display: flex;
  align-items: center;
`
