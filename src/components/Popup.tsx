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
import { ReactNode, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'

import { fadeInOutScaleFast } from '@/animations'
import ModalContainer from '@/modals/ModalContainer'
import { Coordinates } from '@/types/numbers'
import { useWindowSize } from '@/utils/hooks'

interface PopupProps {
  onBackgroundClick: () => void
  children?: ReactNode | ReactNode[]
  title?: string
  hookCoordinates?: Coordinates
}

const minMarginToEdge = 25
const headerHeight = 50

const Popup = ({ children, onBackgroundClick, title, hookCoordinates }: PopupProps) => {
  const { height: windowHeight, width: windowWidth } = useWindowSize() // Recompute position on window resize

  const contentRef = useRef<HTMLDivElement>(null)

  const [hookOffset, setHookOffset] = useState<Coordinates | undefined>(undefined)

  useEffect(() => {
    if (windowHeight && windowWidth) {
      const contentElement = contentRef.current
      const contentRect = contentElement?.getBoundingClientRect()

      const offsetX =
        contentRect?.left && contentRect.left < minMarginToEdge
          ? -contentRect.left + 2 * minMarginToEdge
          : contentRect?.right && windowWidth - contentRect.right < minMarginToEdge
          ? windowWidth - contentRect.right - 2 * minMarginToEdge
          : 0

      const offsetY =
        contentRect?.top && contentRect.top < minMarginToEdge
          ? -contentRect.top + 2 * minMarginToEdge
          : contentRect?.bottom && windowHeight - contentRect.bottom < minMarginToEdge
          ? windowHeight - contentRect.bottom - 2 * minMarginToEdge
          : 0

      setHookOffset({ x: offsetX, y: offsetY })
    }
  }, [windowHeight, windowWidth])

  const PopupContent = (
    <Content role="dialog" ref={contentRef} {...fadeInOutScaleFast}>
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
      {hookCoordinates ? (
        <Hook
          hookCoordinates={hookCoordinates}
          contentWidth={contentRef.current?.clientWidth || 0}
          animate={hookOffset}
          transition={{ duration: 0.1 }}
        >
          {PopupContent}
        </Hook>
      ) : (
        PopupContent
      )}
    </ModalContainer>
  )
}

export default Popup

const Hook = styled(motion.div)<{ hookCoordinates: Coordinates; contentWidth: number }>`
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  top: ${({ hookCoordinates }) => hookCoordinates.y - headerHeight * 1.5}px;
  left: ${({ hookCoordinates, contentWidth }) => hookCoordinates.x - contentWidth / 2}px;
`

const Content = styled(motion.div)`
  position: relative;
  overflow-x: hidden;
  overflow-y: auto;

  min-width: 300px;
  max-height: 500px;
  margin: auto;

  box-shadow: ${({ theme }) => theme.shadow.tertiary};
  border: 1px solid ${({ theme }) => theme.border.primary};
  border-radius: var(--radius-big);
  background-color: ${({ theme }) => theme.bg.background1};
`

const Header = styled.div`
  height: 50px;
  padding: var(--spacing-1) var(--spacing-3);
  border-bottom: 1px solid ${({ theme }) => theme.border.primary};
  background-color: ${({ theme }) => theme.bg.background1};
  display: flex;
  align-items: center;
`
