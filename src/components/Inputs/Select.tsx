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
import { KeyboardEventHandler, MouseEventHandler, OptionHTMLAttributes, useCallback, useEffect, useState } from 'react'
import styled, { css } from 'styled-components'

import { sectionChildrenVariants } from '../PageComponents/PageContainers'
import Popup from '../Popup'
import { inputDefaultStyle, InputLabel, InputProps } from './'

type Writable<T> = T extends string
  ? string
  : T extends number
  ? number
  : T extends undefined
  ? undefined
  : T extends readonly (infer U)[]
  ? U
  : never

export type OptionValue = Writable<OptionHTMLAttributes<HTMLOptionElement>['value']>

export interface SelectOption<T extends OptionValue> {
  value: T
  label: string
}

interface SelectProps<T extends OptionValue> {
  label?: string
  disabled?: boolean
  controlledValue?: SelectOption<T>
  options: SelectOption<T>[]
  title?: string
  id: string
  onValueChange: (value: SelectOption<T> | undefined) => void
  className?: string
  raised?: boolean
  skipEqualityCheck?: boolean
}

function Select<T extends OptionValue>({
  options,
  title,
  label,
  disabled,
  controlledValue,
  className,
  id,
  onValueChange,
  raised,
  skipEqualityCheck = false
}: SelectProps<T>) {
  const [canBeAnimated, setCanBeAnimated] = useState(false)
  const [value, setValue] = useState(controlledValue)
  const [showPopup, setShowPopup] = useState(false)

  const setInputValue = useCallback(
    (option: SelectOption<T>) => {
      if (!value || !isEqual(option, value) || skipEqualityCheck) {
        onValueChange(option)
        setValue(option)
      }
    },
    [onValueChange, skipEqualityCheck, value]
  )

  const onContainerClick = () => {
    if (options.length <= 1) return
    setShowPopup(true)
  }

  useEffect(() => {
    // Controlled component
    if (controlledValue && (!isEqual(controlledValue, value) || skipEqualityCheck)) {
      setValue(controlledValue)
    }
  }, [controlledValue, setInputValue, skipEqualityCheck, value])

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
        onClick={onContainerClick}
      >
        <InputLabel inputHasValue={!!value} htmlFor={id}>
          {label}
        </InputLabel>
        {options.length > 1 && (
          <>
            <MoreIcon>
              <MoreVertical />
            </MoreIcon>
          </>
        )}
        <ClickableInput
          type="text"
          className={className}
          disabled={disabled}
          id={id}
          value={value?.label ?? ''}
          raised={raised ?? false}
          readOnly
        />
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

function SelectOptionsPopup<T extends OptionValue>({
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
  const handleEvent = (el: HTMLSelectElement) => {
    setValue({
      label: options[el.selectedIndex]?.label,
      value: el.value as T
    })
    onBackgroundClick()
  }

  const onClick: MouseEventHandler<HTMLSelectElement> = (event) => handleEvent(event.currentTarget)
  const onKeyPress: KeyboardEventHandler<HTMLSelectElement> = (event) => handleEvent(event.currentTarget)

  return (
    <Popup title={title} onBackgroundClick={onBackgroundClick}>
      <OptionSelect autoFocus size={options.length} onKeyPress={onKeyPress} onClick={onClick}>
        {options.map((o) => (
          <OptionItem key={o.label} value={o.value}>
            {o.label}
          </OptionItem>
        ))}
      </OptionSelect>
    </Popup>
  )
}

const InputContainer = styled(motion.button)`
  position: relative;
  height: var(--inputHeight);
  width: 100%;
  margin: 16px 0;
  padding: 0;
`

export const MoreIcon = styled.div`
  position: absolute;
  top: 11px;
  right: 18px;
  color: ${({ theme }) => theme.font.secondary};
`

export const SelectContainer = styled(InputContainer)`
  cursor: pointer;
`

export const OptionSelect = styled.select`
  width: 100%;
  overflow-y: auto;
  border: 0;
  outline: 0;
  color: inherit;
  background: transparent;
`

export const OptionItem = styled.option`
  padding: var(--spacing-3);
  cursor: pointer;
  background-color: ${({ theme }) => theme.bg.primary};
  color: inherit;

  &:not(:last-child) {
    border-bottom: 1px solid ${({ theme }) => theme.border.primary};
  }

  &:hover {
    background-color: ${({ theme }) => theme.bg.secondary};
  }
`

const ClickableInput = styled.input<InputProps & { raised: boolean }>`
  ${({ isValid }) => inputDefaultStyle(isValid)}
  padding-right: 50px;

  cursor: pointer;

  ${({ raised }) =>
    raised &&
    css`
      background-color: ${({ theme }) => theme.bg.primary};
      border: 1px solid ${({ theme }) => theme.border.secondary};
      box-shadow: ${({ theme }) => theme.shadow.secondary};
    `}
`

export default Select
