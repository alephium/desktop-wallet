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

import { colord } from 'colord'
import { motion } from 'framer-motion'
import { ReactNode, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'

import { fadeInOutScaleFast, fastTransition } from '@/animations'
import ModalContainer from '@/modals/ModalContainer'
import { Coordinates } from '@/types/numbers'
import { useWindowSize } from '@/utils/hooks'

interface PopupProps {
  onClose: () => void
  children?: ReactNode | ReactNode[]
  title?: string
  extraHeaderContent?: ReactNode
  hookCoordinates?: Coordinates
  minWidth?: number
}

const minMarginToEdge = 20
const headerHeight = 50

const Popup = ({ children, onClose, title, hookCoordinates, extraHeaderContent, minWidth = 200 }: PopupProps) => {
  const { height: windowHeight, width: windowWidth } = useWindowSize() // Recompute position on window resize

  const contentRef = useRef<HTMLDivElement>(null)

  const [hookOffset, setHookOffset] = useState<Coordinates>()

  useEffect(() => {
    if (windowHeight && windowWidth) {
      const contentElement = contentRef.current
      const contentRect = contentElement?.getBoundingClientRect()

      const baseOffsetX =
        contentRect?.left && contentRect.left < minMarginToEdge
          ? -contentRect.left + 2 * minMarginToEdge
          : contentRect?.right && windowWidth - contentRect.right < minMarginToEdge
          ? windowWidth - contentRect.right - 2 * minMarginToEdge
          : 0

      const baseOffsetY =
        contentRect?.top && contentRect.top < minMarginToEdge
          ? -contentRect.top + 2 * minMarginToEdge
          : contentRect?.bottom && windowHeight - contentRect.bottom < minMarginToEdge
          ? windowHeight - contentRect.bottom - 2 * minMarginToEdge
          : 0

      setHookOffset({ x: baseOffsetX, y: baseOffsetY - 5 })
    }
  }, [windowHeight, windowWidth])

  const PopupContent = (
    <Content
      role="dialog"
      ref={contentRef}
      style={hookOffset && { x: hookOffset.x, y: hookOffset.y - 15 }}
      animate={hookOffset && { ...fadeInOutScaleFast.animate, ...hookOffset }}
      exit={fadeInOutScaleFast.exit}
      minWidth={minWidth}
      {...fastTransition}
    >
      {title && (
        <Header>
          <h2>{title}</h2>
          {extraHeaderContent}
        </Header>
      )}

      {children}
    </Content>
  )

  return (
    <ModalContainer onClose={onClose}>
      {hookCoordinates ? (
        <Hook hookCoordinates={hookCoordinates} contentWidth={contentRef.current?.clientWidth || 0}>
          {PopupContent}
        </Hook>
      ) : (
        PopupContent
      )}
    </ModalContainer>
  )
}

export default Popup

const Hook = styled.div<{ hookCoordinates: Coordinates; contentWidth: number }>`
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  top: ${({ hookCoordinates }) => hookCoordinates.y - headerHeight / 2}px;
  left: ${({ hookCoordinates, contentWidth }) => hookCoordinates.x - contentWidth / 2}px;
`

const Content = styled(motion.div)<Pick<PopupProps, 'minWidth'>>`
  opacity: 0; // for initial mount computation
  position: relative;
  overflow-x: hidden;
  overflow-y: auto;
  display: flex;
  flex-direction: column;

  min-width: ${({ minWidth }) => minWidth}px;
  max-height: 510px;
  margin: auto;

  box-shadow: ${({ theme }) => theme.shadow.tertiary};
  border: 1px solid ${({ theme }) => theme.border.primary};
  border-radius: var(--radius-big);
  background-color: ${({ theme }) => colord(theme.bg.primary).alpha(0.6).toHex()};
  backdrop-filter: blur(30px) brightness(110%);
`

const Header = styled.div`
  padding: var(--spacing-2) var(--spacing-4);
  border-bottom: 1px solid ${({ theme }) => theme.border.primary};

  display: flex;
  align-items: center;
  z-index: 1;
`
