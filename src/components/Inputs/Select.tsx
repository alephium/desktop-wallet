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

import { isEqual, partition } from 'lodash'
import { MoreVertical, SearchIcon } from 'lucide-react'
import {
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent,
  OptionHTMLAttributes,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { InputHeight, InputLabel, InputProps, inputStyling } from '@/components/Inputs'
import Input, { InputBase } from '@/components/Inputs/Input'
import InputArea from '@/components/Inputs/InputArea'
import { sectionChildrenVariants } from '@/components/PageComponents/PageContainers'
import Popup from '@/components/Popup'
import ModalPortal from '@/modals/ModalPortal'
import { Coordinates } from '@/types/numbers'

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
  heightSize?: InputHeight
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
  className,
  heightSize
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
        heightSize={heightSize}
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
          <SelectOptionsModal
            options={options}
            selectedOption={value}
            setValue={setInputValue}
            title={title}
            hookCoordinates={hookCoordinates}
            onClose={handlePopupClose}
          />
        )}
      </ModalPortal>
    </>
  )
}

interface SelectOptionsModalProps<T extends OptionValue> {
  options: SelectOption<T>[]
  selectedOption?: SelectOption<T>
  setValue: (value: SelectOption<T>) => void | undefined
  onClose: () => void
  hookCoordinates?: Coordinates
  title?: string
  optionRender?: (option: SelectOption<T>) => ReactNode
  onSearchInput?: (input: string) => void
  searchPlaceholder?: string
  showOnly?: T[]
}

export function SelectOptionsModal<T extends OptionValue>({
  options,
  selectedOption,
  setValue,
  onClose,
  hookCoordinates,
  title,
  optionRender,
  onSearchInput,
  searchPlaceholder,
  showOnly
}: SelectOptionsModalProps<T>) {
  const { t } = useTranslation()
  const selectRef = useRef<HTMLDivElement>(null)
  const [focusedOptionIndex, setFocusedOptionIndex] = useState(0)

  // We hide instead of simply not rendering filtered options to avoid changing the height/width of the modal when
  // filtering. When the size of the modal depends on its contents, its size might change when filtering some options
  // out, unless its size is fixed.
  const [visibleOptions, invisibleOptions] = showOnly
    ? partition(options, (option) => showOnly.includes(option.value))
    : [options, []]

  useEffect(() => {
    const selectedOptionIndex = visibleOptions.findIndex((o) => o.value === selectedOption?.value)

    if (visibleOptions && visibleOptions.length > 0) {
      setFocusedOptionIndex(selectedOptionIndex > 0 ? selectedOptionIndex : 0)
    }
  }, [visibleOptions, selectedOption?.value])

  const handleOptionSelect = useCallback(
    (value: T) => {
      const selectedValue = visibleOptions.find((o) => o.value === value)
      if (!selectedValue) return

      setValue(selectedValue)
      onClose()
    },
    [onClose, visibleOptions, setValue]
  )

  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (e.code === 'ArrowDown') {
        setFocusedOptionIndex((i) => (i < visibleOptions.length - 1 ? i + 1 : i))
      } else if (e.code === 'ArrowUp') {
        setFocusedOptionIndex((i) => (i > 0 ? i - 1 : i))
      } else if (['Space', ' ', 'Enter'].includes(e.code)) {
        handleOptionSelect(visibleOptions[focusedOptionIndex].value)
      } else {
        return
      }
    }

    document.addEventListener('keydown', listener)

    return () => {
      document.removeEventListener('keydown', listener)
    }
  }, [focusedOptionIndex, handleOptionSelect, onClose, visibleOptions])

  return (
    <Popup
      title={title}
      onClose={onClose}
      hookCoordinates={hookCoordinates}
      extraHeaderContent={
        onSearchInput && (
          <Searchbar
            placeholder={searchPlaceholder}
            Icon={SearchIcon}
            onChange={(e) => onSearchInput(e.target.value)}
            heightSize="small"
          />
        )
      }
    >
      <OptionSelect title={title} aria-label={title} ref={selectRef}>
        {visibleOptions.map((o, i) => (
          <OptionItem
            key={o.value}
            onClick={() => handleOptionSelect(o.value as T)}
            onMouseEnter={(e) => setFocusedOptionIndex(i)}
            selected={o.value === selectedOption?.value}
            focused={i === focusedOptionIndex}
            aria-label={o.label}
          >
            {optionRender ? optionRender(o) : o.label}
          </OptionItem>
        ))}
        {invisibleOptions.map((o, i) => (
          <OptionItem key={o.value} selected={false} focused={false} invisible>
            {optionRender ? optionRender(o) : o.label}
          </OptionItem>
        ))}
        {visibleOptions.length === 0 && onSearchInput && (
          <OptionItem selected={false} focused={false}>
            {t('No options match the search criteria.')}
          </OptionItem>
        )}
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
  right: ${inputStyling.paddingLeftRight};
  height: 100%;
  display: flex;
  align-items: center;
  color: ${({ theme }) => theme.font.secondary};
`

export const SelectContainer = styled(InputContainer)<Pick<InputProps, 'noMargin' | 'heightSize'>>`
  cursor: pointer;
  margin: ${({ noMargin }) => (noMargin ? 0 : '16px 0')};
  height: ${({ heightSize }) =>
    heightSize === 'small' ? '50px' : heightSize === 'big' ? '60px' : 'var(--inputHeight)'};
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

export const OptionItem = styled.button<{ selected: boolean; focused: boolean; invisible?: boolean }>`
  padding: var(--spacing-4);
  cursor: pointer;
  color: inherit;
  user-select: none;
  text-align: left;
  background-color: ${({ theme, selected, focused }) =>
    selected ? theme.global.accent : focused ? theme.bg.accent : theme.bg.primary};
  visibility: ${({ invisible }) => invisible && 'hidden'};

  &:not(:last-child) {
    border-bottom: 1px solid ${({ theme }) => theme.border.primary};
  }
`

const ClickableInput = styled(InputBase)`
  padding-right: 35px;
  font-weight: var(--fontWeight-semiBold);
  cursor: pointer;
`

const Searchbar = styled(Input)`
  margin: 0;

  svg {
    color: ${({ theme }) => theme.font.tertiary};
  }
`
