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

import { colord } from 'colord'
import { HTMLMotionProps, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import styled, { css } from 'styled-components'

import { sectionChildrenVariants } from './PageComponents/PageContainers'

interface ButtonProps extends HTMLMotionProps<'button'> {
  secondary?: boolean
  alert?: boolean
  disabled?: boolean
  transparent?: boolean
  squared?: boolean
  submit?: boolean
  short?: boolean
  wide?: boolean
  Icon?: LucideIconType
  borderless?: boolean
  className?: string
}

const Button = ({ children, disabled, submit, Icon, className, ...props }: ButtonProps) => {
  const [canBeAnimated, setCanBeAnimateds] = useState(props.squared ? true : false)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!submit) return

    const listener = (e: KeyboardEvent) => {
      if (e.code === 'Enter' || e.code === 'NumpadEnter') {
        buttonRef.current?.click()
      }
    }

    document.addEventListener('keydown', listener)

    return () => {
      document.removeEventListener('keydown', listener)
    }
  }, [submit])

  return (
    <motion.button
      {...props}
      className={className}
      variants={sectionChildrenVariants}
      custom={disabled}
      disabled={disabled}
      animate={canBeAnimated ? (!disabled ? 'shown' : 'disabled') : false}
      onAnimationComplete={() => setCanBeAnimateds(true)}
      type={submit ? 'submit' : 'button'}
      ref={buttonRef}
    >
      {Icon && (
        <ButtonIcon>
          <Icon size={18} />
        </ButtonIcon>
      )}
      {children}
    </motion.button>
  )
}

export default styled(Button)`
  ${({ theme, secondary, alert, transparent, children }) => {
    const bgColor =
      alert && !secondary
        ? theme.global.alert
        : transparent
        ? 'transparent'
        : secondary
        ? theme.bg.secondary
        : theme.global.accent
    const hoverBgColor = transparent
      ? colord(theme.bg.primary).isDark()
        ? colord(theme.bg.accent).lighten(0.7).alpha(0.5).toRgbString()
        : colord(theme.bg.accent).lighten(0.9).alpha(0.4).toRgbString()
      : secondary
      ? colord(theme.bg.tertiary).lighten(0.3).toRgbString()
      : alert
      ? colord(theme.global.alert).darken(0.08).toRgbString()
      : colord(theme.global.accent).darken(0.08).toRgbString()
    const activeBgColor = transparent
      ? colord(theme.bg.primary).isDark()
        ? colord(theme.bg.accent).alpha(0.4).toRgbString()
        : colord(theme.bg.accent).lighten(0.1).alpha(0.15).toRgbString()
      : secondary
      ? colord(theme.bg.tertiary).darken(0.4).toRgbString()
      : alert
      ? colord(theme.global.alert).lighten(0.03).toRgbString()
      : colord(theme.global.accent).lighten(0.03).toRgbString()
    const color =
      alert && secondary
        ? theme.global.alert
        : transparent
        ? theme.font.secondary
        : alert
        ? theme.font.contrastPrimary
        : secondary
        ? theme.global.accent
        : theme.name === 'light'
        ? theme.font.contrastPrimary
        : theme.font.primary
    const hoverColor = transparent && theme.font.primary

    return css`
      color: ${color};
      background-color: ${bgColor};

      &:hover {
        color: ${hoverColor};
        background-color: ${hoverBgColor};
      }

      &:active {
        background-color: ${activeBgColor};
      }

      ${ButtonIcon} {
        ${children &&
        css`
          margin-right: var(--spacing-2);
        `}

        svg {
          color: ${color};
        }
      }
    `
  }}

  display: flex;
  align-items: center;
  justify-content: center;
  height: ${({ squared, short }) => (squared ? '40px' : short ? '34px' : 'var(--inputHeight)')};
  width: ${({ squared, short, wide }) => (squared ? '40px' : short ? 'auto' : wide ? '100%' : '80%')};
  max-width: ${({ wide }) => (wide ? 'auto' : '250px')};
  border-radius: var(--radius-medium);
  border: 1px solid ${({ theme, borderless }) => (borderless ? 'transparent' : theme.border.primary)};
  font-weight: var(--fontWeight-medium);
  font-size: 13px;
  font-family: inherit;
  margin: ${({ squared }) => (squared ? '0' : '12px 0')};
  padding: ${({ squared }) => (squared ? 'var(--spacing-2)' : '0 13px')};
  min-width: ${({ squared }) => (squared ? '40px' : '60px')};
  text-align: center;
  cursor: pointer;

  transition: 0.2s ease-out;

  &:disabled {
    opacity: 0.5;
  }

  pointer-events: ${({ disabled: deactivated }) => (deactivated ? 'none' : 'auto')};

  &:focus-visible {
    box-shadow: 0 0 0 3px ${({ theme }) => colord(theme.global.accent).darken(0.2).toRgbString()};
  }
`

const ButtonIcon = styled.div`
  display: flex;
`
