/*
Copyright 2018 - 2023 The Alephium Authors
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
import { MoreVertical, SearchIcon } from 'lucide-react'
import {
  KeyboardEvent as ReactKeyboardEvent,
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

import CheckMark from '@/components/CheckMark'
import { inputDefaultStyle, InputHeight, InputLabel, InputProps, inputStyling } from '@/components/Inputs'
import Input from '@/components/Inputs/Input'
import InputArea from '@/components/Inputs/InputArea'
import { sectionChildrenVariants } from '@/components/PageComponents/PageContainers'
import Popup from '@/components/Popup'
import Truncate from '@/components/Truncate'
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
  optionRender?: (option: SelectOption<T>, isSelected?: boolean) => ReactNode
  title?: string
  id: string
  onSelect: (value: T) => void
  raised?: boolean
  contrast?: boolean
  skipEqualityCheck?: boolean
  noMargin?: boolean
  className?: string
  simpleMode?: boolean
  heightSize?: InputHeight
  renderCustomComponent?: (value?: SelectOption<T>, disablePointer?: boolean) => ReactNode
  ListBottomComponent?: ReactNode
}

function Select<T extends OptionValue>({
  options,
  optionRender,
  title,
  label,
  disabled,
  controlledValue,
  id,
  onSelect,
  raised,
  contrast,
  skipEqualityCheck = false,
  noMargin,
  simpleMode,
  className,
  heightSize,
  renderCustomComponent,
  ListBottomComponent
}: SelectProps<T>) {
  const selectedValueRef = useRef<HTMLDivElement>(null)

  const [canBeAnimated, setCanBeAnimated] = useState(false)
  const [value, setValue] = useState(controlledValue)
  const [showPopup, setShowPopup] = useState(false)
  const [hookCoordinates, setHookCoordinates] = useState<Coordinates | undefined>(undefined)

  const multipleAvailableOptions = options.length > 1

  const getContainerCenter = (): Coordinates | undefined => {
    if (selectedValueRef?.current) {
      const containerElement = selectedValueRef.current
      const containerElementRect = containerElement.getBoundingClientRect()

      return {
        x: containerElementRect.x + containerElement.clientWidth / 2,
        y: containerElementRect.y + containerElement.clientHeight / 2
      }
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

  const handleClick = () => {
    if (!multipleAvailableOptions) return

    setHookCoordinates(getContainerCenter())
    setShowPopup(true)
  }

  const handleKeyDown = (e: ReactKeyboardEvent) => {
    if (![' ', 'ArrowDown', 'ArrowUp'].includes(e.key)) return
    if (!multipleAvailableOptions) return
    setHookCoordinates(getContainerCenter())
    setShowPopup(true)
  }

  const handlePopupClose = () => {
    setShowPopup(false)
    selectedValueRef.current?.focus()
  }

  useEffect(() => {
    // Controlled component
    if ((controlledValue && !isEqual(controlledValue, value)) || skipEqualityCheck) {
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
        style={{ zIndex: raised && showPopup ? 2 : undefined, boxShadow: disabled ? 'none' : undefined }}
        heightSize={heightSize}
        simpleMode={simpleMode}
        tabIndex={renderCustomComponent ? -1 : 0}
        showPointer={multipleAvailableOptions}
      >
        {renderCustomComponent ? (
          <CustomComponentContainer ref={selectedValueRef}>
            {renderCustomComponent(value, !multipleAvailableOptions)}
          </CustomComponentContainer>
        ) : (
          <>
            <InputLabel isElevated={!!value} htmlFor={id}>
              {label}
            </InputLabel>
            {multipleAvailableOptions && !simpleMode && (
              <MoreIcon>
                <MoreVertical size={16} />
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
              contrast={contrast}
              showPointer={multipleAvailableOptions}
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
            optionRender={optionRender}
            selectedOption={value}
            setValue={setInputValue}
            title={title}
            hookCoordinates={hookCoordinates}
            onClose={handlePopupClose}
            parentSelectRef={selectedValueRef}
            ListBottomComponent={ListBottomComponent}
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
  ListBottomComponent?: ReactNode
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
  parentSelectRef,
  ListBottomComponent
}: SelectOptionsModalProps<T>) {
  const { t } = useTranslation()
  const optionSelectRef = useRef<HTMLDivElement>(null)

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

  const handleOptionSelect = useCallback(
    (value: T) => {
      const selectedValue = visibleOptions.find((o) => o.value === value)
      if (!selectedValue) return

      setValue(selectedValue)
      onClose()
    },
    [onClose, visibleOptions, setValue]
  )

  const parentSelectWidth = parentSelectRef?.current?.clientWidth
  const minWidth = parentSelectWidth && parentSelectWidth > 200 ? parentSelectWidth + 10 : undefined

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
            noMargin
          />
        )
      }
    >
      <OptionSelect title={title} aria-label={title} ref={optionSelectRef}>
        {isEmpty ? (
          <OptionItem selected={false}>{emptyListPlaceholder}</OptionItem>
        ) : emptySearchResults ? (
          <OptionItem selected={false}>{t('No options match the search criteria.')}</OptionItem>
        ) : null}
        {visibleOptions.map((option) => {
          const isSelected = option.value === selectedOption?.value
          return (
            <OptionItem
              key={option.value}
              tabIndex={0}
              role="listitem"
              onClick={() => handleOptionSelect(option.value as T)}
              selected={isSelected}
              focusable
              aria-label={option.label}
            >
              {optionRender ? optionRender(option, isSelected) : option.label}
              {isSelected && <CheckMark />}
            </OptionItem>
          )
        })}
        {ListBottomComponent && <div onClick={onClose}>{ListBottomComponent}</div>}
        {invisibleOptions.map((option) => (
          <OptionItem key={option.value} selected={false} invisible>
            {optionRender ? optionRender(option) : option.label}
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

  outline: none;
`

export const MoreIcon = styled.div`
  position: absolute;
  right: ${inputStyling.paddingLeftRight};
  height: 100%;
  display: flex;
  align-items: center;
  color: ${({ theme }) => theme.font.secondary};
`

const SelectedValue = styled.div<InputProps>`
  ${({ heightSize, label, contrast }) => inputDefaultStyle(true, true, !!label, heightSize, contrast)};

  padding-right: 35px;
  font-weight: var(--fontWeight-semiBold);

  cursor: ${({ showPointer }) => showPointer && 'pointer'};

  display: flex;
  align-items: center;
  min-width: 0;
  box-shadow: ${({ theme }) => theme.shadow.primary};

  ${({ simpleMode }) =>
    simpleMode &&
    css`
      border: 0;

      &:not(:hover) {
        background-color: transparent;
      }
    `}
`

export const SelectContainer = styled(InputContainer)<
  Pick<InputProps, 'noMargin' | 'heightSize' | 'simpleMode' | 'showPointer'>
>`
  cursor: ${({ showPointer }) => showPointer && 'pointer'};
  margin: ${({ noMargin, simpleMode }) => (noMargin || simpleMode ? 0 : '16px 0')};
  height: ${({ heightSize }) =>
    heightSize === 'small' ? '50px' : heightSize === 'big' ? '60px' : 'var(--inputHeight)'};

  &:focus {
    ${SelectedValue} {
      box-shadow: 0 0 0 1px ${({ theme }) => theme.global.accent};
      border-color: ${({ theme }) => theme.global.accent};
    }
  }
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

export const OptionItem = styled.button<{ selected: boolean; focusable?: boolean; invisible?: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-4);
  cursor: pointer;
  color: ${({ theme }) => theme.font.primary};
  user-select: none;
  text-align: left;
  background-color: ${({ theme }) => colord(theme.bg.primary).alpha(0.4).toHex()};
  visibility: ${({ invisible }) => invisible && 'hidden'};
  font-weight: ${({ theme, selected }) => selected && 'var(--fontWeight-semiBold)'};

  &:not(:last-child) {
    border-bottom: 1px solid ${({ theme }) => theme.border.primary};
  }

  ${({ focusable }) =>
    focusable &&
    css`
      &:focus {
        background-color: ${({ theme }) => theme.bg.accent};
      }

      &:hover {
        background-color: ${({ theme }) => theme.bg.hover};
      }
    `}
`

const Searchbar = styled(Input)`
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
