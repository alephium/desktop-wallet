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

import { ReactNode, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import Button from '@/components/Button'
import { inputDefaultStyle, InputLabel } from '@/components/Inputs'
import InputArea from '@/components/Inputs/InputArea'
import { OptionItem } from '@/components/Inputs/Select'
import Popup from '@/components/Popup'
import Truncate from '@/components/Truncate'
import ModalPortal from '@/modals/ModalPortal'
import { onEnterOrSpace, removeItemFromArray } from '@/utils/misc'

interface MultiSelectOptionsProps<T> {
  options: T[]
  selectedOptions: T[]
  onOptionClick: (option: T) => void
  onAllButtonClick: () => void
  renderOption: (option: T) => ReactNode
  getOptionKey: (option: T) => string
  getOptionA11YText: (option: T) => string
  isOptionSelected: (option: T, selectedOptions: T[]) => boolean
  modalTitle: string
  allowSearch?: boolean
}

interface MultiSelectProps<T> extends MultiSelectOptionsProps<T> {
  label: string
  renderSelectedValue: () => ReactNode
  className?: string
}

interface MultiSelectOptionsModalProps<T> extends MultiSelectOptionsProps<T> {
  onClose: () => void
}

export interface MultiSelectOption<T> {
  value: T
  label: string
}

function MultiSelect<T>({ selectedOptions, label, renderSelectedValue, className, ...props }: MultiSelectProps<T>) {
  const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false)

  const openOptionsModal = () => setIsOptionsModalOpen(true)

  return (
    <InputArea
      className={className}
      onMouseDown={openOptionsModal}
      onKeyDown={(e) => onEnterOrSpace(e, openOptionsModal)}
    >
      <InputLabel isElevated={selectedOptions.length > 0}>{label}</InputLabel>
      <SelectedValue>
        <Truncate>{renderSelectedValue()}</Truncate>
      </SelectedValue>
      <ModalPortal>
        {isOptionsModalOpen && (
          <MultiSelectOptionsModal
            selectedOptions={selectedOptions}
            onClose={() => setIsOptionsModalOpen(false)}
            {...props}
          />
        )}
      </ModalPortal>
    </InputArea>
  )
}

export function MultiSelectOptionsModal<T>({
  options,
  selectedOptions,
  onOptionClick,
  onAllButtonClick,
  renderOption,
  getOptionKey,
  getOptionA11YText,
  isOptionSelected,
  modalTitle,
  onClose
}: MultiSelectOptionsModalProps<T>) {
  const { t } = useTranslation()

  const [focusedOptionIndex, setFocusedOptionIndex] = useState<number>()

  const allOptionsAreSelected = selectedOptions.length === options.length

  return (
    <Popup
      title={modalTitle}
      onClose={onClose}
      extraHeaderContent={
        <AllButton role="secondary" short onClick={onAllButtonClick}>
          {allOptionsAreSelected ? t('Unselect all') : t('Select all')}
        </AllButton>
      }
    >
      <Options>
        {options.map((option, index) => (
          <OptionItem
            key={getOptionKey(option)}
            tabIndex={0}
            role="listitem"
            onClick={() => onOptionClick(option)}
            selected={isOptionSelected(option, selectedOptions)}
            onMouseEnter={() => setFocusedOptionIndex(index)}
            focused={index === focusedOptionIndex}
            aria-label={getOptionA11YText(option)}
          >
            {renderOption(option)}
          </OptionItem>
        ))}
      </Options>
    </Popup>
  )
}

export function handleOptionClick<T>(
  optionClicked: T,
  selectedOptions: T[],
  selectedOptionsSetter: (options: T[]) => void
) {
  const index = selectedOptions.findIndex((option) => option === optionClicked)

  index !== -1
    ? selectedOptionsSetter(removeItemFromArray(selectedOptions, index))
    : selectedOptionsSetter([optionClicked, ...selectedOptions])
}

export function handleAllButtonClick<T>(
  selectedOptions: T[],
  options: T[],
  selectedOptionsSetter: (options: T[]) => void
) {
  selectedOptions.length === options.length ? selectedOptionsSetter([]) : selectedOptionsSetter(options)
}

export function renderOption<T>(option: MultiSelectOption<T>) {
  return option.label
}

export default MultiSelect

const SelectedValue = styled.div`
  ${inputDefaultStyle(true, true, true)};

  display: flex;
  align-items: center;
  min-width: 0;

  border: 0;

  transition: 0.2s ease-out;

  &:not(:hover) {
    background-color: transparent;
  }
`

const Options = styled.div`
  display: flex;
  flex-direction: column;
`

const AllButton = styled(Button)`
  margin: 0;
  margin-left: auto;
`
