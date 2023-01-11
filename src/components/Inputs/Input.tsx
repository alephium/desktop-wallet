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

import classNames from 'classnames'
import { colord } from 'colord'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { WheelEvent } from 'react'
import { useState } from 'react'
import styled from 'styled-components'

import { fadeInBottom } from '@/animations'
import {
  inputDefaultStyle,
  InputErrorMessage,
  InputLabel,
  InputProps,
  InputValidIconContainer
} from '@/components/Inputs'
import { sectionChildrenVariants } from '@/components/PageComponents/PageContainers'

const Input = ({
  label,
  error,
  isValid,
  disabled,
  onChange,
  value,
  noMargin,
  hint,
  children,
  ...props
}: InputProps) => {
  const [canBeAnimated, setCanBeAnimated] = useState(false)

  const className = classNames(props.className, {
    error,
    isValid
  })

  const handleScroll = (e: WheelEvent<HTMLElement>) => {
    e.currentTarget.blur() // prevent changing number value by scrolling
  }

  return (
    <InputContainer
      variants={sectionChildrenVariants}
      animate={canBeAnimated ? (!disabled ? 'shown' : 'disabled') : false}
      onAnimationComplete={() => setCanBeAnimated(true)}
      custom={disabled}
      noMargin={noMargin}
    >
      <InputLabel inputHasValue={!!value} htmlFor={props.id}>
        {label}
      </InputLabel>
      <InputBase
        {...props}
        label={label}
        value={value}
        onChange={onChange}
        className={className}
        disabled={disabled}
        isValid={isValid}
        onWheel={handleScroll}
      />
      {!disabled && isValid && (
        <InputValidIconContainer {...fadeInBottom}>
          <Check strokeWidth={3} />
        </InputValidIconContainer>
      )}
      {!disabled && error && <InputErrorMessage animate={{ y: 10, opacity: 1 }}>{error}</InputErrorMessage>}
      {hint && <Hint>{hint}</Hint>}
      {children}
    </InputContainer>
  )
}

export default Input

export const InputContainer = styled(motion.div)<Pick<InputProps, 'noMargin'>>`
  position: relative;
  min-height: var(--inputHeight);
  width: 100%;
  margin: ${({ noMargin }) => (noMargin ? 0 : '16px 0')};
`

export const InputBase = styled.input<InputProps>`
  ${({ isValid, value, label }) => inputDefaultStyle(isValid, !!value, !!label)};
  color-scheme: ${({ theme }) => (colord(theme.bg.primary).isDark() ? 'dark' : 'light')};
`

const Hint = styled.div`
  font-size: 10px;
  color: ${({ theme }) => theme.font.secondary};
  margin-left: 12px;
  margin-top: 6px;
`
