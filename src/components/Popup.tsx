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
import { ReactNode, useRef } from 'react'
import styled, { CSSProperties } from 'styled-components'

import { fadeInOutScaleFast } from '@/animations'
import ModalContainer from '@/modals/ModalContainer'
import { Coordinates } from '@/types/numbers'
import { useWindowSize } from '@/utils/hooks'

interface PopupProps {
  onBackgroundClick: () => void
  children?: ReactNode | ReactNode[]
  title?: string
  hookPosition?: Coordinates
}

const Popup = ({ children, onBackgroundClick, title, hookPosition }: PopupProps) => {
  useWindowSize() // Recompute position on window resize

  const contentRef = useRef<HTMLDivElement>(null)

  let wrapperStyle: CSSProperties | undefined = undefined

  if (hookPosition) {
    const contentElement = contentRef.current

    wrapperStyle = {
      position: 'absolute',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      top: hookPosition.y,
      left: hookPosition.x,
      width: 0,
      height: 0,
      marginTop: contentElement ? -contentElement?.offsetHeight / 2 : 0
    }
  }

  const PopupContent = (
    <Content onClick={(e) => e.stopPropagation()} role="dialog" ref={contentRef} {...fadeInOutScaleFast}>
      {title && (
        <Header>
          <h2>{title}</h2>
        </Header>
      )}
      {children}
    </Content>
  )

  return (
    <ModalContainer onClose={onBackgroundClick}>
      {hookPosition ? <div style={wrapperStyle}>{PopupContent}</div> : PopupContent}
    </ModalContainer>
  )
}

export default Popup

const Content = styled(motion.div)`
  position: relative;
  overflow-x: hidden;
  overflow-y: auto;

  width: 30vw;
  min-width: 300px;
  max-height: 500px;
  margin: auto;

  box-shadow: ${({ theme }) => theme.shadow.tertiary};
  border: 1px solid ${({ theme }) => theme.border.primary};
  border-radius: var(--radius-big);
  background-color: ${({ theme }) => theme.bg.background1};
`

const Header = styled.div`
  padding: var(--spacing-1) var(--spacing-3);
  border-bottom: 1px solid ${({ theme }) => theme.border.primary};
  background-color: ${({ theme }) => theme.bg.background1};
  display: flex;
  align-items: center;
`
