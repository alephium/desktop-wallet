/*
Copyright 2018 - 2021 The Alephium Authors
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

import { HTMLMotionProps, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import tinycolor from 'tinycolor2'

import { sectionChildrenVariants } from './PageComponents/PageContainers'

interface ButtonProps extends HTMLMotionProps<'button'> {
  secondary?: boolean
  alert?: boolean
  disabled?: boolean
  transparent?: boolean
  squared?: boolean
  submit?: boolean
}

export const Button = ({ children, disabled, submit, ...props }: ButtonProps) => {
  const [canBeAnimated, setCanBeAnimateds] = useState(props.squared ? true : false)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if ((submit && e.code === 'Enter') || e.code === 'NumpadEnter') {
        buttonRef.current?.click()
      }
    }

    document.addEventListener('keydown', listener)

    return () => {
      document.removeEventListener('keydown', listener)
    }
  })

  return (
    <StyledButton
      {...props}
      variants={sectionChildrenVariants}
      custom={disabled}
      disabled={disabled}
      animate={canBeAnimated ? (!disabled ? 'shown' : 'disabled') : false}
      onAnimationComplete={() => setCanBeAnimateds(true)}
      type={submit ? 'submit' : 'button'}
      ref={buttonRef}
    >
      {children}
    </StyledButton>
  )
}

const StyledButton = styled(motion.button)<ButtonProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  height: ${({ squared }) => (squared ? '40px' : 'var(--inputHeight)')};
  width: ${({ squared }) => (squared ? '40px' : '80%')};
  max-width: 250px;
  border-radius: var(--radius);
  border: none;
  background-color: ${({ theme, secondary, transparent, alert }) =>
    alert && !secondary
      ? theme.global.alert
      : transparent
      ? 'transparent'
      : secondary
      ? theme.bg.secondary
      : theme.global.accent};
  color: ${({ theme, secondary, alert, transparent }) =>
    alert && secondary
      ? theme.global.alert
      : transparent
      ? theme.font.secondary
      : alert
      ? theme.font.contrastPrimary
      : secondary
      ? theme.global.accent
      : theme.font.contrastPrimary};
  font-weight: var(--fontWeight-medium);
  font-size: inherit;
  font-family: inherit;
  margin: ${({ squared }) => (squared ? '0' : '12px 0')};
  padding: ${({ squared }) => (squared ? 'var(--spacing-2)' : '0 13px')};
  min-width: ${({ squared }) => (squared ? '40px' : '60px')};
  text-align: center;

  transition: 0.2s ease-out;

  &:hover {
    background-color: ${({ theme, secondary, transparent, alert }) =>
      transparent
        ? 'transparent'
        : secondary
        ? tinycolor(theme.bg.tertiary).lighten(30).toString()
        : alert
        ? tinycolor(theme.global.alert).darken(8).toString()
        : tinycolor(theme.global.accent).darken(8).toString()};

    color: ${({ theme, transparent }) => transparent && theme.font.primary};
    cursor: pointer;
  }

  &:active {
    background-color: ${({ theme, secondary, alert }) =>
      secondary
        ? tinycolor(theme.bg.tertiary).darken(40).toString()
        : alert
        ? tinycolor(theme.global.alert).lighten(3).toString()
        : tinycolor(theme.global.accent).lighten(3).toString()};
  }

  pointer-events: ${({ disabled: deactivated }) => (deactivated ? 'none' : 'auto')};

  &:focus-visible {
    box-shadow: 0 0 0 3px ${({ theme }) => tinycolor(theme.global.accent).darken(20).toString()};
  }
`
