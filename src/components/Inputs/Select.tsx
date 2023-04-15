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
import { isEqual, partition } from 'lodash'
import { Check, MoreVertical, SearchIcon } from 'lucide-react'
import {
  ComponentType,
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent,
  OptionHTMLAttributes,
  ReactNode,
  RefObject,
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react'
import { useTranslation } from 'react-i18next'
import styled, { css } from 'styled-components'

import { inputDefaultStyle, InputHeight, InputLabel, InputProps, inputStyling } from '@/components/Inputs'
import Input from '@/components/Inputs/Input'
import InputArea from '@/components/Inputs/InputArea'
import { sectionChildrenVariants } from '@/components/PageComponents/PageContainers'
import Popup from '@/components/Popup'
import Truncate from '@/components/Truncate'
import ModalPortal from '@/modals/ModalPortal'
import { Coordinates } from '@/types/numbers'
import { onTabPress } from '@/utils/misc'

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
  onSelect: (value: T) => void
  raised?: boolean
  skipEqualityCheck?: boolean
  noMargin?: boolean
  className?: string
  simpleMode?: boolean
  heightSize?: InputHeight
  CustomComponent?: ComponentType<{
    controlledValue?: SelectOption<T>
    label?: string
  }>
}

function Select<T extends OptionValue>({
  options,
  title,
  label,
  disabled,
  controlledValue,
  id,
  onSelect,
  raised,
  skipEqualityCheck = false,
  noMargin,
  simpleMode,
  className,
  heightSize,
  CustomComponent
}: SelectProps<T>) {
  const selectedValueRef = useRef<HTMLDivElement>(null)

  const [canBeAnimated, setCanBeAnimated] = useState(false)
  const [value, setValue] = useState(controlledValue)
  const [showPopup, setShowPopup] = useState(false)
  const [hookCoordinates, setHookCoordinates] = useState<Coordinates | undefined>(undefined)

  let containerCenter: Coordinates

  if (selectedValueRef?.current) {
    const containerElement = selectedValueRef.current
    const containerElementRect = containerElement.getBoundingClientRect()

    containerCenter = {
      x: containerElementRect.x + containerElement.clientWidth / 2,
      y: containerElementRect.y + containerElement.clientHeight / 2
    }
  }

  const setInputValue = useCallback(
    (option: SelectOption<T>) => {
      if (!value || !isEqual(option, value) || skipEqualityCheck) {
        onSelect(option.value)
        setValue(option)

        selectedValueRef.current?.focus()
      }
    },
    [onSelect, skipEqualityCheck, value]
  )

  const handleClick = (e: MouseEvent) => {
    if (options.length <= 1) {
      options.length === 1 && onSelect(options[0].value)
      return
    }

    setHookCoordinates(containerCenter)
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
    selectedValueRef.current?.focus()
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
        simpleMode={simpleMode}
      >
        {CustomComponent ? (
          <CustomComponentContainer ref={selectedValueRef}>
            <CustomComponent label={label} controlledValue={value} />
          </CustomComponentContainer>
        ) : (
          <>
            <InputLabel isElevated={!!value} htmlFor={id}>
              {label}
            </InputLabel>
            {options.length > 1 && !simpleMode && (
              <MoreIcon>
                <MoreVertical />
              </MoreIcon>
            )}
            <SelectedValue
              tabIndex={-1}
              className={className}
              ref={selectedValueRef}
              id={id}
              simpleMode={simpleMode}
              label={label}
              heightSize={heightSize}
            >
              <Truncate>{value?.label}</Truncate>
            </SelectedValue>
          </>
        )}
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
            parentSelectRef={selectedValueRef}
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
  optionRender?: (option: SelectOption<T>, isSelected?: boolean) => ReactNode
  onSearchInput?: (input: string) => void
  searchPlaceholder?: string
  showOnly?: T[]
  emptyListPlaceholder?: string
  parentSelectRef?: RefObject<HTMLDivElement>
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
  showOnly,
  emptyListPlaceholder,
  parentSelectRef
}: SelectOptionsModalProps<T>) {
  const { t } = useTranslation()
  const optionSelectRef = useRef<HTMLDivElement>(null)
  const [focusedOptionIndex, setFocusedOptionIndex] = useState(0)

  // We hide instead of simply not rendering filtered options to avoid changing the height/width of the modal when
  // filtering. When the size of the modal depends on its contents, its size might change when filtering some options
  // out, unless its size is fixed.
  const [visibleOptions, invisibleOptions] = showOnly
    ? partition(options, (option) => showOnly.includes(option.value))
    : [options, []]
  const isEmpty = options.length === 0 && emptyListPlaceholder
  const emptySearchResults = visibleOptions.length === 0 && onSearchInput
  // To display the message without changing the height, remove one of the invisible options
  if (emptySearchResults) invisibleOptions.pop()

  useEffect(() => {
    const selectedOptionIndex = options.findIndex((o) => o.value === selectedOption?.value)

    if (options && options.length > 0) {
      setFocusedOptionIndex(selectedOptionIndex > 0 ? selectedOptionIndex : 0)
    }
  }, [options, selectedOption?.value])

  const handleOptionSelect = useCallback(
    (value: T) => {
      const selectedValue = visibleOptions.find((o) => o.value === value)
      if (!selectedValue) return

      setValue(selectedValue)
      onClose()
    },
    [onClose, visibleOptions, setValue]
  )

  const selectFirstOption = () => setFocusedOptionIndex(0)

  useEffect(() => {
    const selectOptions = optionSelectRef?.current
    const listener = (e: KeyboardEvent) => {
      if (['ArrowDown', 'Tab'].includes(e.code)) {
        setFocusedOptionIndex((i) => (i < visibleOptions.length - 1 ? i + 1 : i))
      } else if (e.code === 'ArrowUp') {
        setFocusedOptionIndex((i) => (i > 0 ? i - 1 : i))
      } else if (['Space', ' ', 'Enter'].includes(e.code)) {
        handleOptionSelect(visibleOptions[focusedOptionIndex].value)
      } else {
        return
      }
    }

    selectOptions?.addEventListener('keydown', listener)

    return () => {
      selectOptions?.removeEventListener('keydown', listener)
    }
  }, [focusedOptionIndex, handleOptionSelect, onClose, visibleOptions])

  const parentSelectWidth = parentSelectRef?.current?.clientWidth
  const minWidth = parentSelectWidth && parentSelectWidth > 200 ? parentSelectWidth : undefined

  return (
    <Popup
      title={title}
      onClose={onClose}
      hookCoordinates={hookCoordinates}
      minWidth={minWidth}
      extraHeaderContent={
        onSearchInput &&
        !isEmpty && (
          <Searchbar
            placeholder={searchPlaceholder}
            Icon={SearchIcon}
            onChange={(e) => onSearchInput(e.target.value)}
            heightSize="small"
            onKeyDown={(e) => onTabPress(e, selectFirstOption)}
          />
        )
      }
    >
      <OptionSelect title={title} aria-label={title} ref={optionSelectRef}>
        {isEmpty ? (
          <OptionItem selected={false} focused={false}>
            {emptyListPlaceholder}
          </OptionItem>
        ) : emptySearchResults ? (
          <OptionItem selected={false} focused={false}>
            {t('No options match the search criteria.')}
          </OptionItem>
        ) : null}
        {visibleOptions.map((o, i) => {
          const isSelected = o.value === selectedOption?.value
          return (
            <OptionItem
              key={o.value}
              tabIndex={0}
              role="listitem"
              onClick={() => handleOptionSelect(o.value as T)}
              onMouseEnter={() => setFocusedOptionIndex(i)}
              selected={isSelected}
              focused={i === focusedOptionIndex}
              aria-label={o.label}
            >
              {optionRender ? optionRender(o, isSelected) : o.label}
              {isSelected && (
                <CheckMark>
                  <Check strokeWidth={3} />
                </CheckMark>
              )}
            </OptionItem>
          )
        })}
        {invisibleOptions.map((o) => (
          <OptionItem key={o.value} selected={false} focused={false} invisible>
            {optionRender ? optionRender(o) : o.label}
          </OptionItem>
        ))}
      </OptionSelect>
    </Popup>
  )
}

export default Select

const InputContainer = styled(InputArea)`
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

export const SelectContainer = styled(InputContainer)<Pick<InputProps, 'noMargin' | 'heightSize' | 'simpleMode'>>`
  cursor: pointer;
  margin: ${({ noMargin, simpleMode }) => (noMargin || simpleMode ? 0 : '16px 0')};
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-4);
  cursor: pointer;
  color: ${({ theme, selected }) => (selected ? theme.font.primary : theme.font.secondary)};
  user-select: none;
  text-align: left;
  background-color: ${({ theme, focused }) => (focused ? theme.bg.accent : theme.bg.primary)};
  visibility: ${({ invisible }) => invisible && 'hidden'};

  &:not(:last-child) {
    border-bottom: 1px solid ${({ theme }) => theme.border.primary};
  }

  &:focus {
    background-color: ${({ theme, selected }) =>
      !selected ? theme.bg.accent : colord(theme.global.accent).lighten(0.05).toRgbString()};
  }
`

const SelectedValue = styled.div<InputProps>`
  ${({ heightSize, label }) => inputDefaultStyle(true, true, !!label, heightSize)};

  padding-right: 35px;
  font-weight: var(--fontWeight-semiBold);
  cursor: pointer;

  display: flex;
  align-items: center;
  min-width: 0;

  ${({ simpleMode }) =>
    simpleMode &&
    css`
      border: 0;

      &:not(:hover) {
        background-color: transparent;
      }
    `}
`

const CheckMark = styled.div`
  height: 19px;
  width: 19px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.global.accent};
  color: white;
  border-radius: 40px;
  padding: 3px;
`

const Searchbar = styled(Input)`
  margin: 0;

  svg {
    color: ${({ theme }) => theme.font.tertiary};
  }
`

const CustomComponentContainer = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`
