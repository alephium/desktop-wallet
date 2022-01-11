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

import { motion, Transition } from 'framer-motion'
import styled, { useTheme } from 'styled-components'

interface ToggleProps {
  toggled: boolean
  onToggle: (value: boolean) => void
  className?: string
}

const Toggle: React.FC<ToggleProps> = ({ toggled, onToggle, className }) => {
  const theme = useTheme()

  const toggleBackgroundVariants = {
    off: { backgroundColor: theme.bg.secondary },
    on: { backgroundColor: theme.global.accent }
  }

  const floatingIndicatorVariant = {
    off: { left: 0 },
    on: { left: '50%' }
  }

  const toggleState = toggled ? 'on' : 'off'

  const transition: Transition = { duration: 0.2, type: 'tween' }

  return (
    <StyledToggle
      onClick={() => onToggle(!toggled)}
      className={className}
      toggled={toggled}
      variants={toggleBackgroundVariants}
      animate={toggleState}
      transition={transition}
    >
      <ToggleFloatingIndicator variants={floatingIndicatorVariant} animate={toggleState} transition={transition} />
    </StyledToggle>
  )
}

export const StyledToggle = styled(motion.div)<Omit<ToggleProps, 'onToggle'>>`
  position: relative;
  width: calc(var(--toggleHeight) * 2);
  height: var(--toggleHeight);
  border: 1px solid ${({ theme }) => theme.border.primary};
  border-radius: calc(var(--toggleHeight) * 2);
  background-color: ${({ theme, toggled }) => (toggled ? theme.global.accent : theme.bg.tertiary)};
  overflow: hidden;
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
  background-color: var(--color-white);
  border-radius: calc(var(--toggleHeight) * 2);
  z-index: 0;
  box-shadow: 0 2px 2px rgba(0, 0, 0, 0.15);
`

export default Toggle
