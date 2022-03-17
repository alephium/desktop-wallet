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
import styled, { css, useTheme } from 'styled-components'

interface ToggleProps {
  toggled: boolean
  onToggle: (value: boolean) => void
  className?: string
  disabled?: boolean
}

const toggleMarginInPx = 2

const Toggle = ({ toggled, onToggle, className, disabled }: ToggleProps) => {
  const theme = useTheme()
  const toggleWidth = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--toggleWidth'))

  const toggleBackgroundVariants = {
    off: { backgroundColor: theme.bg.tertiary },
    on: { backgroundColor: theme.global.accent }
  }

  const floatingIndicatorVariant = {
    off: { left: 0 },
    on: { left: toggleWidth / 2 - toggleMarginInPx * 2 }
  }

  const toggleState = toggled ? 'on' : 'off'

  const transition: Transition = { duration: 0.2, type: 'tween' }

  const onClick = () => {
    if (!disabled) {
      onToggle(!toggled)
    }
  }

  return (
    <StyledToggle
      onClick={onClick}
      className={className}
      toggled={toggled}
      variants={toggleBackgroundVariants}
      animate={toggleState}
      transition={transition}
      disabled={disabled}
    >
      <ToggleFloatingIndicatorContainer
        variants={floatingIndicatorVariant}
        animate={toggleState}
        transition={transition}
      >
        <ToggleFloatingIndicator />
      </ToggleFloatingIndicatorContainer>
    </StyledToggle>
  )
}

export const StyledToggle = styled(motion.div)<Omit<ToggleProps, 'onToggle'>>`
  position: relative;
  width: var(--toggleWidth);
  height: var(--toggleHeight);
  border-radius: calc(var(--toggleHeight) * 2);
  overflow: hidden;
  cursor: pointer;
  box-sizing: content-box;

  svg {
    cursor: pointer;
  }

  ${({ disabled }) =>
    disabled &&
    css`
      cursor: not-allowed;
      opacity: 0.5;
    `}
`

const ToggleFloatingIndicatorContainer = styled(motion.div)`
  position: absolute;
  width: var(--toggleHeight);
  height: var(--toggleHeight);
  z-index: 0;
`

const ToggleFloatingIndicator = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  margin: ${toggleMarginInPx}px;
  background-color: var(--color-white);
  border-radius: calc(var(--toggleHeight) * 2);
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.2);
`

export default Toggle
