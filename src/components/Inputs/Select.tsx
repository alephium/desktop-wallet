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

import { AnimatePresence, motion } from 'framer-motion'
import { isEqual } from 'lodash'
import { MoreVertical } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'

import { sectionChildrenVariants } from '../PageComponents/PageContainers'
import Popup from '../Popup'
import { inputDefaultStyle, InputLabel, inputPlaceHolderVariants, InputProps } from './'

interface SelectOption<T> {
  value: T
  label: string
}

interface SelectProps<T> {
  placeholder?: string
  disabled?: boolean
  controlledValue?: SelectOption<T>
  options: SelectOption<T>[]
  title?: string
  id: string
  onValueChange: (value: SelectOption<T> | undefined) => void
  className?: string
}

function Select<T>({
  options,
  title,
  placeholder,
  disabled,
  controlledValue,
  className,
  id,
  onValueChange
}: SelectProps<T>) {
  const [canBeAnimated, setCanBeAnimated] = useState(false)
  const [value, setValue] = useState(controlledValue)
  const [showPopup, setShowPopup] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const setInputValue = useCallback(
    (option: SelectOption<T>) => {
      if (!value || !isEqual(option, value)) {
        onValueChange && onValueChange(option)

        setValue(option)

        // Set value in input
        if (inputRef.current && option) {
          inputRef.current.value = option.label
        }
      }
    },
    [onValueChange, value]
  )

  useEffect(() => {
    // Controlled component
    if (controlledValue) {
      setInputValue(controlledValue)
    }
  }, [controlledValue, setInputValue])

  useEffect(() => {
    // If only one value, select it
    if (!value && options.length === 1) {
      setInputValue(options[0])
    }
  }, [options, setInputValue, value])

  return (
    <>
      <SelectContainer
        variants={sectionChildrenVariants}
        animate={canBeAnimated ? (!disabled ? 'shown' : 'disabled') : false}
        onAnimationComplete={() => setCanBeAnimated(true)}
        custom={disabled}
        onClick={() => setShowPopup(true)}
      >
        <InputLabel variants={inputPlaceHolderVariants} animate={!value ? 'down' : 'up'} htmlFor={id}>
          {placeholder}
        </InputLabel>
        <MoreIcon>
          <MoreVertical />
        </MoreIcon>
        <ClickableInput type="button" className={className} ref={inputRef} disabled={disabled} id={id} />
      </SelectContainer>
      <AnimatePresence>
        {showPopup && (
          <SelectOptionsPopup
            options={options}
            setValue={setInputValue}
            title={title}
            onBackgroundClick={() => {
              setShowPopup(false)
            }}
          />
        )}
      </AnimatePresence>
    </>
  )
}

function SelectOptionsPopup<T>({
  options,
  setValue,
  onBackgroundClick,
  title
}: {
  options: SelectOption<T>[]
  setValue: (value: SelectOption<T>) => void | undefined
  onBackgroundClick: () => void
  title?: string
}) {
  const handleOptionSelect = (value: SelectOption<T>) => {
    setValue(value)
    onBackgroundClick()
  }

  return (
    <Popup title={title} onBackgroundClick={onBackgroundClick}>
      {options.map((o) => (
        <OptionItem key={o.label} onClick={() => handleOptionSelect(o)}>
          {o.label}
        </OptionItem>
      ))}
    </Popup>
  )
}

const InputContainer = styled(motion.div)`
  position: relative;
  height: var(--inputHeight);
  width: 100%;
  margin: var(--spacing-3) 0;
`

const MoreIcon = styled.div`
  position: absolute;
  top: 12px;
  right: 18px;
  color: ${({ theme }) => theme.font.secondary};
`

const SelectContainer = styled(InputContainer)`
  cursor: pointer;
`

const OptionItem = styled.div`
  padding: var(--spacing-3);
  cursor: pointer;
  background-color: ${({ theme }) => theme.bg.primary};

  &:not(:last-child) {
    border-bottom: 1px solid ${({ theme }) => theme.border.primary};
  }

  &:hover {
    background-color: ${({ theme }) => theme.bg.secondary};
  }
`

const ClickableInput = styled.input<InputProps>`
  ${({ isValid }) => inputDefaultStyle(isValid)}
`

export default Select
