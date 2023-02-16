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
import { HTMLMotionProps, motion, Variants } from 'framer-motion'
import { InputHTMLAttributes, ReactNode, RefObject } from 'react'
import styled, { css, CSSProperties } from 'styled-components'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: ReactNode
  error?: ReactNode
  isValid?: boolean
  disabled?: boolean
  noMargin?: boolean
  hint?: string
  Icon?: LucideIconType
  inputFieldStyle?: CSSProperties
  inputFieldRef?: RefObject<HTMLInputElement>
  liftLabel?: boolean
  className?: string
}

export interface TextAreaProps extends InputHTMLAttributes<HTMLTextAreaElement> {
  error?: string
  isValid?: boolean
  disabled?: boolean
}

export const inputPlaceHolderVariants: Variants = {
  up: { y: -17, fontSize: '9px' },
  down: { y: 0, scale: 1 }
}

export const inputStyling = {
  paddingRight: '12px',
  paddingLeftRight: '15px'
}

export const inputDefaultStyle = (hasIcon?: boolean, hasValue?: boolean, hasLabel?: boolean) => css`
  background-image: none;
  height: var(--inputHeight);
  width: 100%;
  border-radius: var(--radius-big);
  background-color: ${({ theme }) => theme.bg.primary};
  border: 1px solid ${({ theme }) => theme.border.primary};
  color: ${({ theme }) => theme.font.primary};
  padding: ${hasIcon ? `0 45px 0 ${inputStyling.paddingRight}` : `0 ${inputStyling.paddingLeftRight}`};
  font-weight: var(--fontWeight-medium);
  font-size: 1em;
  text-align: left;
  font-family: inherit;

  ${hasValue &&
  hasLabel &&
  css`
    padding-top: 10px;
  `}

  transition: 0.2s ease-out;

  &:focus {
    background-color: ${({ theme }) => theme.bg.primary};
    border: 1px solid ${({ theme }) => theme.global.accent};
  }

  &.error {
    border: 1px solid ${({ theme }) => theme.global.alert};
    background-color: ${({ theme }) => colord(theme.global.alert).alpha(0.1).toRgbString()};
  }

  &:disabled {
    background-color: ${({ theme }) => theme.bg.secondary};
    border: 1px solid ${({ theme }) => theme.border.primary};
    cursor: not-allowed;
  }

  // Remove number arrows
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  /* Firefox */
  &[type='number'] {
    -moz-appearance: textfield;
  }
`

export const InputErrorMessage = styled(motion.label)<InputProps>`
  position: absolute;
  bottom: -7px;
  right: var(--spacing-2);
  font-weight: var(--fontWeight-medium);
  opacity: 0;
  font-size: 0.8em;
  color: ${({ theme }) => theme.global.alert};
`

export const InputLabel: FC<HTMLMotionProps<'label'> & { inputHasValue: boolean }> = ({ inputHasValue, ...props }) => (
  <StyledInputLabel
    {...props}
    variants={inputPlaceHolderVariants}
    animate={!inputHasValue ? 'down' : 'up'}
    transition={{ duration: 0.15 }}
  />
)

const StyledInputLabel = styled(motion.label)`
  position: absolute;

  left: ${inputStyling.paddingLeftRight};
  height: 100%;
  display: flex;
  align-items: center;
  font-weight: var(--fontWeight-semiBold);
  color: ${({ theme }) => theme.font.secondary};
  pointer-events: none;
  transform-origin: left;
`

export const InputIconContainer = styled(motion.div)`
  position: absolute;
  top: 0;
  bottom: 0;
  right: var(--spacing-4);
  font-weight: var(--fontWeight-medium);
  display: flex;
  align-items: center;
`
