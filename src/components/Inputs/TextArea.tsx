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
import { motion, Variants } from 'framer-motion'
import { Check } from 'lucide-react'
import { useState } from 'react'
import styled from 'styled-components'

import { sectionChildrenVariants } from '../PageComponents/PageContainers'
import { inputDefaultStyle, InputErrorMessage, InputLabel, InputValidIconContainer, TextAreaProps } from './index'

const placeHolderVariants: Variants = {
  up: { y: -35, x: -5, scale: 0.8 },
  down: { y: 0, scale: 1 }
}

const TextArea = ({ placeholder, error, isValid, disabled, onChange, value, ...props }: TextAreaProps) => {
  const [canBeAnimated, setCanBeAnimated] = useState(false)

  const className = classNames({
    error,
    isValid
  })

  return (
    <TextAreaContainer
      variants={sectionChildrenVariants}
      animate={canBeAnimated ? (!disabled ? 'shown' : 'disabled') : false}
      onAnimationComplete={() => setCanBeAnimated(true)}
      custom={disabled}
    >
      <InputLabel variants={placeHolderVariants} animate={!value ? 'down' : 'up'}>
        {placeholder}
      </InputLabel>
      <StyledTextArea
        {...props}
        value={value}
        onChange={onChange}
        className={className}
        disabled={disabled}
        isValid={isValid}
      />

      {!disabled && isValid && (
        <InputValidIconContainer initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          <Check strokeWidth={3} />
        </InputValidIconContainer>
      )}
      {!disabled && error && <InputErrorMessage animate={{ y: 10, opacity: 1 }}>{error}</InputErrorMessage>}
    </TextAreaContainer>
  )
}

const TextAreaContainer = styled(motion.div)`
  position: relative;
  width: 100%;
  margin: var(--spacing-3) 0;
`

const StyledTextArea = styled.textarea<TextAreaProps>`
  ${({ isValid }) => inputDefaultStyle(isValid)}
  resize: none;
  outline: none;
  padding-top: 13px;
  min-height: 300px;
  border-radius: var(--radius);
`

export default TextArea
