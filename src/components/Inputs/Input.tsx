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

import classNames from 'classnames'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { useState } from 'react'
import styled from 'styled-components'

import { sectionChildrenVariants } from '../PageComponents/PageContainers'
import { inputDefaultStyle, InputErrorMessage, inputPlaceHolderVariants, InputProps } from './index'

const Input = ({ placeholder, error, isValid, disabled, onChange, value, ...props }: InputProps) => {
  const [canBeAnimated, setCanBeAnimated] = useState(false)

  const className = classNames({
    error,
    isValid
  })

  return (
    <InputContainer
      variants={sectionChildrenVariants}
      animate={canBeAnimated ? (!disabled ? 'shown' : 'disabled') : false}
      onAnimationComplete={() => setCanBeAnimated(true)}
      custom={disabled}
    >
      <Label variants={inputPlaceHolderVariants} animate={!value ? 'down' : 'up'} htmlFor={props.id}>
        {placeholder}
      </Label>
      <StyledInput
        {...props}
        value={value}
        onChange={onChange}
        className={className}
        disabled={disabled}
        isValid={isValid}
      />
      {!disabled && isValid && (
        <ValidIconContainer initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          <Check strokeWidth={3} />
        </ValidIconContainer>
      )}
      {!disabled && error && <InputErrorMessage animate={{ y: 10, opacity: 1 }}>{error}</InputErrorMessage>}
    </InputContainer>
  )
}

// === Styling

const InputContainer = styled(motion.div)`
  position: relative;
  height: var(--inputHeight);
  width: 100%;
  margin: var(--spacing-3) 0;
`

const Label = styled(motion.label)`
  position: absolute;
  top: 16px;
  left: 13px;
  font-weight: var(--fontWeight-medium);
  color: ${({ theme }) => theme.font.secondary};
  pointer-events: none;
`

const ValidIconContainer = styled(motion.div)`
  position: absolute;
  top: 0;
  bottom: 0;
  right: var(--spacing-4);
  font-weight: var(--fontWeight-medium);
  display: flex;
  align-items: center;
  color: ${({ theme }) => theme.global.valid};
`

const StyledInput = styled.input<InputProps>`
  ${({ isValid }) => inputDefaultStyle(isValid)}
`

export default Input
