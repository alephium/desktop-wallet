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
import { useRef } from 'react'
import styled, { useTheme } from 'styled-components'

interface ToggleProps {
  toggled: boolean
  onToggle: (value: boolean) => void
  small?: boolean
  className?: string
}

const Toggle: React.FC<ToggleProps> = ({ toggled, onToggle, small = false, className }) => {
  const theme = useTheme()

  const toggleBackgroundVariants = useRef({
    off: { backgroundColor: theme.bg.secondary },
    on: { backgroundColor: theme.global.accent }
  })

  const floatingIndicatorVariant = useRef({
    off: { left: 0 },
    on: { left: '50%' }
  })

  const toggleState = toggled ? 'on' : 'off'

  const animation = { duration: 0.5, type: 'spring' }

  return (
    <StyledToggle
      onClick={() => onToggle(!toggled)}
      className={className}
      small={small}
      toggled={toggled}
      variants={toggleBackgroundVariants.current}
      animate={toggleState}
      transition={animation}
    >
      <ToggleFloatingIndicator
        variants={floatingIndicatorVariant.current}
        animate={toggleState}
        transition={animation}
      />
    </StyledToggle>
  )
}

const toggleWidth = 80
const toggleHeight = toggleWidth / 2

export const StyledToggle = styled(motion.div)<Omit<ToggleProps, 'onToggle'>>`
  position: relative;
  width: ${({ small }) => (small ? toggleWidth / 1.5 : toggleWidth)}px;
  height: ${({ small }) => (small ? toggleHeight / 1.5 : toggleHeight)}px;
  border: 1px solid ${({ theme }) => theme.border.primary};
  border-radius: 60px;
  background-color: ${({ theme, toggled }) => (toggled ? theme.global.accent : theme.bg.contrast)};
  cursor: pointer;
  box-sizing: content-box;

  svg {
    cursor: pointer;
  }
`

const ToggleFloatingIndicator = styled(motion.div)`
  position: absolute;
  width: 50%;
  height: 100%;
  background-color: ${({ theme }) => theme.font.primary};
  border-radius: 60px;
  z-index: 0;
`

export default Toggle
