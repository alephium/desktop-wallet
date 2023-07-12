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

import { motion } from 'framer-motion'
import { PointerEvent, useState } from 'react'
import styled from 'styled-components'

import { getPointerAbsolutePositionInElement } from '@/utils/pointer'

// TODO: Copied from explorer

interface CursorHighlightProps {
  className?: string
}

const CursorHighlight = ({ className }: CursorHighlightProps) => {
  const [visible, setVisible] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  const handlePointerEnter = () => (!visible ? setVisible(true) : null)
  const handlePointerLeave = () => (visible ? setVisible(false) : null)

  const handlePointerMove = (e: PointerEvent) => {
    const position = getPointerAbsolutePositionInElement(e)

    setPosition(position)
  }

  return (
    <Container
      onPointerMove={handlePointerMove}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      className={className}
    >
      <HighlightContainer style={{ x: position.x, y: position.y, opacity: visible ? 1 : 0 }}>
        <Highlight />
      </HighlightContainer>
    </Container>
  )
}

const Container = styled(motion.div)`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  overflow: hidden;
`

const HighlightContainer = styled(motion.div)`
  height: 900px;
  width: 900px;
`

const Highlight = styled(motion.div)`
  height: 100%;
  width: 100%;
  border-radius: 100%;
  background: radial-gradient(
    ${({ theme }) => (theme.name === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)')} 0%,
    transparent 40%
  );
  transform: translateX(-50%) translateY(-50%);
`

export default CursorHighlight
