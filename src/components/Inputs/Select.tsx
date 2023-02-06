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

import { isEqual } from 'lodash'
import { MoreVertical } from 'lucide-react'
import {
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent,
  OptionHTMLAttributes,
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react'
import styled from 'styled-components'

import { InputLabel, InputProps } from '@/components/Inputs'
import InputArea from '@/components/Inputs/InputArea'
import { sectionChildrenVariants } from '@/components/PageComponents/PageContainers'
import Popup from '@/components/Popup'
import ModalPortal from '@/modals/ModalPortal'
import { Coordinates } from '@/types/numbers'

import { InputBase } from './Input'

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
  raised?: boolean
  skipEqualityCheck?: boolean
  noMargin?: boolean
  className?: string
}

function Select<T extends OptionValue>({
  options,
  title,
  label,
  disabled,
  controlledValue,
  id,
  onValueChange,
  raised,
  skipEqualityCheck = false,
  noMargin,
  className
}: SelectProps<T>) {
  const inputRef = useRef<HTMLInputElement>(null)

  const [canBeAnimated, setCanBeAnimated] = useState(false)
  const [value, setValue] = useState(controlledValue)
  const [showPopup, setShowPopup] = useState(false)
  const [hookCoordinates, setHookCoordinates] = useState<Coordinates | undefined>(undefined)

  let containerCenter: Coordinates

  if (inputRef?.current) {
    const containerElement = inputRef.current
    const containerElementRect = containerElement.getBoundingClientRect()

    containerCenter = {
      x: containerElementRect.x + containerElement.clientWidth / 2,
      y: containerElementRect.y + containerElement.clientHeight / 2
    }
  }

  const setInputValue = useCallback(
    (option: SelectOption<T>) => {
      if (!value || !isEqual(option, value) || skipEqualityCheck) {
        onValueChange(option)
        setValue(option)

        inputRef.current?.focus()
      }
    },
    [onValueChange, skipEqualityCheck, value]
  )

  const handleClick = (e: MouseEvent) => {
    if (options.length <= 1) return

    setHookCoordinates({ x: e.clientX, y: e.clientY })
    setShowPopup(true)
  }

  const handleKeyDown = (e: ReactKeyboardEvent) => {
    if (![' ', 'ArrowDown', 'ArrowUp'].includes(e.key)) return
    if (options.length <= 1) return
    setHookCoordinates(containerCenter)
    setShowPopup(true)
  }

  const handlePopupClose = () => {
    setShowPopup(false)
    inputRef.current?.focus()
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

  useEffect(() => {
    if (value && !options.find((option) => option.value === value.value)) {
      setValue(undefined)
    }
  }, [options, value])

  return (
    <>
      <SelectContainer
        variants={sectionChildrenVariants}
        animate={canBeAnimated ? (!disabled ? 'shown' : 'disabled') : false}
        onAnimationComplete={() => setCanBeAnimated(true)}
        custom={disabled}
        noMargin={noMargin}
        onMouseDown={handleClick}
        onKeyDown={handleKeyDown}
        style={{ zIndex: raised && showPopup ? 2 : undefined }}
      >
        <InputLabel inputHasValue={!!value} htmlFor={id}>
          {label}
        </InputLabel>
        {options.length > 1 && (
          <MoreIcon>
            <MoreVertical />
          </MoreIcon>
        )}
        <ClickableInput
          type="text"
          tabIndex={-1}
          className={className}
          disabled={disabled}
          id={id}
          value={value?.label ?? ''}
          readOnly
          label={label}
          ref={inputRef}
        />
      </SelectContainer>
      <ModalPortal>
        {showPopup && (
          <SelectOptionsPopup
            options={options}
            selectedOption={value}
            setValue={setInputValue}
            title={title}
            hookCoordinates={hookCoordinates}
            onBackgroundClick={handlePopupClose}
          />
        )}
      </ModalPortal>
    </>
  )
}

function SelectOptionsPopup<T extends OptionValue>({
  options,
  selectedOption,
  setValue,
  onBackgroundClick,
  hookCoordinates,
  title
}: {
  options: SelectOption<T>[]
  selectedOption?: SelectOption<T>
  setValue: (value: SelectOption<T>) => void | undefined
  onBackgroundClick: () => void
  hookCoordinates?: Coordinates
  title?: string
}) {
  const selectRef = useRef<HTMLDivElement>(null)
  const [focusedOptionIndex, setFocusedOptionIndex] = useState(0)

  useEffect(() => {
    const selectedOptionIndex = options.findIndex((o) => o.value === selectedOption?.value)

    if (options && options.length > 0) {
      setFocusedOptionIndex(selectedOptionIndex > 0 ? selectedOptionIndex : 0)
    }
  }, [options, selectedOption?.value])

  const handleOptionSelect = useCallback(
    (value: T) => {
      const selectedValue = options.find((o) => o.value === value)
      if (!selectedValue) return

      setValue(selectedValue)
      onBackgroundClick()
    },
    [onBackgroundClick, options, setValue]
  )

  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (e.code === 'ArrowDown') {
        setFocusedOptionIndex((i) => (i < options.length - 1 ? i + 1 : i))
      } else if (e.code === 'ArrowUp') {
        setFocusedOptionIndex((i) => (i > 0 ? i - 1 : i))
      } else if (['Space', ' ', 'Enter'].includes(e.code)) {
        handleOptionSelect(options[focusedOptionIndex].value)
      } else if (e.code === 'Tab') {
        e.preventDefault()
        onBackgroundClick()
      } else {
        return
      }
    }

    document.addEventListener('keydown', listener)

    return () => {
      document.removeEventListener('keydown', listener)
    }
  }, [focusedOptionIndex, handleOptionSelect, onBackgroundClick, options])

  return (
    <Popup title={title} onBackgroundClick={onBackgroundClick} hookCoordinates={hookCoordinates}>
      <OptionSelect title={title} aria-label={title} ref={selectRef}>
        {options.map((o, i) => (
          <OptionItem
            key={o.value}
            onClick={() => handleOptionSelect(o.value as T)}
            onMouseEnter={(e) => setFocusedOptionIndex(i)}
            selected={o.value === selectedOption?.value}
            focused={i === focusedOptionIndex}
            aria-label={o.label}
          >
            {o.label}
          </OptionItem>
        ))}
      </OptionSelect>
    </Popup>
  )
}

export default Select

const InputContainer = styled(InputArea)`
  position: relative;
  height: var(--inputHeight);
  width: 100%;
  margin: 16px 0;
  padding: 0;
`

export const MoreIcon = styled.div`
  position: absolute;
  top: 14px;
  right: 10px;
  color: ${({ theme }) => theme.font.secondary};
`

export const SelectContainer = styled(InputContainer)<Pick<InputProps, 'noMargin'>>`
  cursor: pointer;
  margin: ${({ noMargin }) => (noMargin ? 0 : '16px 0')};
`

export const OptionSelect = styled.div`
  width: 100%;
  overflow-y: auto;
  border: 0;
  color: inherit;
  background: transparent;
  display: flex;
  flex-direction: column;
`

export const OptionItem = styled.button<{ selected: boolean; focused: boolean }>`
  padding: var(--spacing-4);
  cursor: pointer;
  color: inherit;
  user-select: none;
  text-align: left;
  background-color: ${({ theme, selected, focused }) =>
    selected ? theme.global.accent : focused ? theme.bg.accent : theme.bg.primary};

  &:not(:last-child) {
    border-bottom: 1px solid ${({ theme }) => theme.border.primary};
  }
`

const ClickableInput = styled(InputBase)`
  padding-right: 35px;
  font-weight: var(--fontWeight-semiBold);
  cursor: pointer;
`
