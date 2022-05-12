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

import { HTMLMotionProps, motion, Variants } from 'framer-motion'
import { FC } from 'react'
import styled, { css } from 'styled-components'
import tinycolor from 'tinycolor2'

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'placeholder'> {
  label?: React.ReactNode
  error?: React.ReactNode
  isValid?: boolean
  disabled?: boolean
  className?: string
}

export interface TextAreaProps extends React.InputHTMLAttributes<HTMLTextAreaElement> {
  error?: string
  isValid?: boolean
  disabled?: boolean
}

export const inputPlaceHolderVariants: Variants = {
  up: { y: -35, x: -5, scale: 0.8 },
  down: { y: 0, scale: 1 }
}

export const inputDefaultStyle = (isValid?: boolean) => {
  return css`
    background-image: none;
    height: var(--inputHeight);
    width: 100%;
    border-radius: var(--radius);
    background-color: ${({ theme }) => theme.bg.secondary};
    border: 1px solid ${({ theme }) => theme.border.primary};
    color: ${({ theme }) => theme.font.primary};
    padding: ${isValid ? '0 45px 0 12px' : '0 12px'};
    font-weight: var(--fontWeight-medium);
    font-size: 1em;
    text-align: left;
    font-family: inherit;
    box-shadow: inset ${({ theme }) => theme.shadow.primary};

    transition: 0.2s ease-out;

    &:focus {
      background-color: ${({ theme }) => theme.bg.primary};
      border: 1px solid ${({ theme }) => theme.global.accent};
    }

    &.error {
      border: 1px solid ${({ theme }) => theme.global.alert};
      background-color: ${({ theme }) => tinycolor(theme.global.alert).setAlpha(0.1).toString()};
    }

    &:disabled {
      background-color: ${({ theme }) => theme.bg.secondary};
      border: 1px solid ${({ theme }) => theme.border.primary};
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
}

export const InputErrorMessage = styled(motion.label)<InputProps>`
  position: absolute;
  bottom: -7px;
  right: var(--spacing-2);
  font-weight: var(--fontWeight-medium);
  opacity: 0;
  font-size: 0.8em;
  color: ${({ theme }) => theme.global.alert};
`

export let InputLabel: FC<HTMLMotionProps<'label'> & { inputHasValue: boolean }> = ({ inputHasValue, ...props }) => (
  <motion.label
    {...props}
    variants={inputPlaceHolderVariants}
    animate={!inputHasValue ? 'down' : 'up'}
    transition={{ duration: 0.15 }}
  />
)

InputLabel = styled(InputLabel)`
  position: absolute;
  top: 15px;
  left: 13px;
  font-weight: var(--fontWeight-medium);
  color: ${({ theme }) => theme.font.secondary};
  pointer-events: none;
  transform-origin: left;
`

export const InputValidIconContainer = styled(motion.div)`
  position: absolute;
  top: 0;
  bottom: 0;
  right: var(--spacing-4);
  font-weight: var(--fontWeight-medium);
  display: flex;
  align-items: center;
  color: ${({ theme }) => theme.global.valid};
`
