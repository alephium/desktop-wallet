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
  ToggleIcons?: [LucideIconType, LucideIconType]
  handleColors?: [string, string]
}

const Toggle = ({ toggled, onToggle, className, disabled, ToggleIcons, handleColors }: ToggleProps) => {
  const theme = useTheme()
  const [ToggleIconRight, ToggleIconLeft] = ToggleIcons ?? [undefined, undefined]

  const toggleBackgroundVariants = {
    off: { backgroundColor: theme.bg.tertiary },
    on: { backgroundColor: handleColors ? theme.bg.tertiary : theme.global.accent }
  }

  const handleVariantsLeft = {
    off: { backgroundColor: 'transparent' },
    on: { backgroundColor: handleColors?.[1] ?? 'var(--color-white)' }
  }

  const handleVariantsRight = {
    off: { backgroundColor: handleColors?.[0] ?? 'var(--color-white)' },
    on: { backgroundColor: 'transparent' }
  }

  const toggleState = toggled ? 'on' : 'off'

  const transition: Transition = { duration: 0.2, type: 'tween' }

  const onClick = () => {
    if (!disabled) {
      onToggle(!toggled)
    }
  }

  const getToggleIconColor = (isActive: boolean) => (isActive ? 'var(--color-white)' : theme.font.tertiary)

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
      {ToggleIconRight && ToggleIconLeft && (
        <ToggleContent>
          <ToggleIconContainer>
            <ToggleIcon animate={toggleState} transition={transition} variants={handleVariantsRight}>
              <ToggleIconRight color={getToggleIconColor(!toggled)} size={16} className="toggle-icon" strokeWidth={2} />
            </ToggleIcon>
          </ToggleIconContainer>
          <ToggleIconContainer>
            <ToggleIcon animate={toggleState} transition={transition} variants={handleVariantsLeft}>
              <ToggleIconLeft color={getToggleIconColor(toggled)} size={16} className="toggle-icon" strokeWidth={2} />
            </ToggleIcon>
          </ToggleIconContainer>
        </ToggleContent>
      )}
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

const ToggleContent = styled.div`
  position: absolute;
  right: 0;
  left: 0;
  top: 0;
  bottom: 0;
  z-index: 1;
  display: flex;
`

const ToggleIconContainer = styled.div`
  display: flex;
  width: 50%;
  justify-content: center;
  align-items: center;

  .toggle-icon {
  }
`

const ToggleIcon = styled(motion.div)`
  background-color: var(--color-white);
  border-radius: 100%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
`

export default Toggle
