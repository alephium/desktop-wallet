// Copyright 2018 - 2021 The Alephium Authors
// This file is part of the alephium project.
//
// The library is free software: you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// The library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public License
// along with the library. If not, see <http://www.gnu.org/licenses/>.

import { AnimatePresence, motion, Variants } from 'framer-motion'
import styled, { css } from 'styled-components'
import tinycolor from 'tinycolor2'
import classNames from 'classnames'
import { useState, useRef, useEffect, useCallback } from 'react'
import { Check, MoreVertical } from 'lucide-react'
import Tags from '@yaireo/tagify/dist/react.tagify'
import { isEqual } from 'lodash'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
  isValid?: boolean
  disabled?: boolean
}

interface TextAreaProps extends React.InputHTMLAttributes<HTMLTextAreaElement> {
  error?: string
  isValid?: boolean
  disabled?: boolean
}

const variants: Variants = {
  hidden: { y: 10, opacity: 0 },
  shown: (disabled) => ({ y: 0, opacity: disabled ? 0.5 : 1 }),
  disabled: { y: 0, opacity: 0.5 }
}

const placeHolderVariants: Variants = {
  up: { y: -35, x: -5, scale: 0.8 },
  down: { y: 0, scale: 1 }
}

export const Input = ({ placeholder, error, isValid, disabled, onChange, value, ...props }: InputProps) => {
  const [canBeAnimated, setCanBeAnimated] = useState(false)

  const className = classNames({
    error,
    isValid
  })

  return (
    <InputContainer
      variants={variants}
      animate={canBeAnimated ? (!disabled ? 'shown' : 'disabled') : false}
      onAnimationComplete={() => setCanBeAnimated(true)}
      custom={disabled}
    >
      <Label variants={placeHolderVariants} animate={!value ? 'down' : 'up'} htmlFor={props.id}>
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
      {!disabled && error && <ErrorMessage animate={{ y: 10, opacity: 1 }}>{error}</ErrorMessage>}
    </InputContainer>
  )
}

// === TEXT AREA === //

export const TextArea = ({ placeholder, error, isValid, disabled, onChange, value, ...props }: TextAreaProps) => {
  const [canBeAnimated, setCanBeAnimated] = useState(false)

  const className = classNames({
    error,
    isValid
  })

  return (
    <TextAreaContainer
      variants={variants}
      animate={canBeAnimated ? (!disabled ? 'shown' : 'disabled') : false}
      onAnimationComplete={() => setCanBeAnimated(true)}
      custom={disabled}
    >
      <Label variants={placeHolderVariants} animate={!value ? 'down' : 'up'}>
        {placeholder}
      </Label>
      <StyledTextArea
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
      {!disabled && error && <ErrorMessage animate={{ y: 10, opacity: 1 }}>{error}</ErrorMessage>}
    </TextAreaContainer>
  )
}

// === TEXTAREA TAGS === //
export const TextAreaTags = (props: React.ComponentProps<typeof Tags>) => {
  return (
    <TextAreaTagsContainer className={props.className}>
      <StyledTags
        {...props}
        settings={{
          enforceWhitelist: true,
          delimiters: ' ',
          maxTags: 24,
          duplicates: true,
          dropdown: {
            enabled: 1, // show suggestion after 1 typed character
            fuzzySearch: false, // match only suggestions that starts with the typed characters
            position: 'all',
            classname: 'tags-dropdown',
            maxItems: 5,
            highlightFirst: true
          },
          addTagOnBlur: false
        }}
      />
      <div className="tags-dropdown" />
    </TextAreaTagsContainer>
  )
}

// === SELECT === //

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

export function Select<T>({
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
        variants={variants}
        animate={canBeAnimated ? (!disabled ? 'shown' : 'disabled') : false}
        onAnimationComplete={() => setCanBeAnimated(true)}
        custom={disabled}
        onClick={() => setShowPopup(true)}
      >
        <Label variants={placeHolderVariants} animate={!value ? 'down' : 'up'} htmlFor={id}>
          {placeholder}
        </Label>
        <MoreIcon>
          <MoreVertical />
        </MoreIcon>
        <StyledInput type="button" className={className} ref={inputRef} disabled={disabled} id={id} />
      </SelectContainer>
      <AnimatePresence>
        {showPopup && (
          <SelectOptionsPopup
            options={options}
            setValue={setInputValue}
            title={title}
            handleBackgroundClick={() => {
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
  handleBackgroundClick,
  title
}: {
  options: SelectOption<T>[]
  setValue: (value: SelectOption<T>) => void | undefined
  handleBackgroundClick: () => void
  title?: string
}) {
  const handleOptionSelect = (value: SelectOption<T>) => {
    setValue(value)
    handleBackgroundClick()
  }

  return (
    <PopupContainer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => {
        handleBackgroundClick()
      }}
    >
      <Popup
        onClick={(e) => {
          e.stopPropagation()
        }}
        initial={{ y: -10 }}
        animate={{ y: 0 }}
        exit={{ y: -10 }}
      >
        {title && (
          <SelectOptionsHeader>
            <h2>{title}</h2>
          </SelectOptionsHeader>
        )}
        {options.map((o) => (
          <OptionItem key={o.label} onClick={() => handleOptionSelect(o)}>
            {o.label}
          </OptionItem>
        ))}
      </Popup>
    </PopupContainer>
  )
}

// === Styling

const InputContainer = styled(motion.div)`
  position: relative;
  height: 46px;
  width: 100%;
  margin: var(--spacing-3) 0;
`

const TextAreaContainer = styled(motion.div)`
  position: relative;
  width: 100%;
  margin: var(--spacing-3) 0;
`

const TextAreaTagsContainer = styled(motion.div)`
  width: 100%;
  margin: var(--spacing-3) 0;
  border-radius: var(--radius);
  color: ${({ theme }) => theme.font.secondary};

  .tagify__input:empty::before {
    // Placeholder
    color: ${({ theme }) => theme.font.secondary};
  }
`

const Label = styled(motion.label)`
  position: absolute;
  top: 16px;
  left: 13px;
  font-weight: var(--fontWeight-medium);
  color: ${({ theme }) => theme.font.secondary};
  pointer-events: none;
`

const ErrorMessage = styled(motion.label)<InputProps>`
  position: absolute;
  bottom: -7px;
  right: var(--spacing-2);
  font-weight: var(--fontWeight-medium);
  opacity: 0;
  font-size: 0.8em;
  color: ${({ theme }) => theme.global.alert};
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

const defaultStyle = (isValid?: boolean) => {
  return css`
    background-image: none;
    height: 46px;
    width: 100%;
    border-radius: var(--radius);
    background-color: ${({ theme }) => theme.bg.secondary};
    border: 1px solid ${({ theme }) => theme.border.primary};
    color: ${({ theme }) => theme.font.primary};
    padding: ${isValid ? '0 45px 0 12px' : '0 12px'};
    font-weight: var(--fontWeight-medium);
    font-size: 1em;
    text-align: left;
    font-family: inherit;

    transition: 0.2s ease-out;

    &:focus {
      background-color: ${({ theme }) => theme.bg.primary};
      border: 1px solid ${({ theme }) => theme.global.accent};
    }

    &.error {
      border: 1px solid ${({ theme }) => theme.global.alert};
      background-color: ${({ theme }) => tinycolor(theme.global.alert).setAlpha(0.1).toString()};
    }

    &:disabled {
      background-color: ${({ theme }) => theme.bg.secondary};
      border: 1px solid ${({ theme }) => theme.border.primary};
    }
  `
}

const StyledInput = styled.input<InputProps>`
  ${({ isValid }) => defaultStyle(isValid)}
`

const StyledTextArea = styled.textarea<TextAreaProps>`
  ${({ isValid }) => defaultStyle(isValid)}
  resize: none;
  outline: none;
  padding-top: 13px;
  min-height: 300px;
  border-radius: var(--radius);
`

// NOTE: Tags dropdown is styled in GlobalStyles

const StyledTags = styled(Tags)`
  ${defaultStyle(true)}
  height: auto;
  padding: var(--spacing-1);
  line-height: 20px;
  border-radius: var(--radius);
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

const PopupContainer = styled(motion.div)`
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  display: flex;
  background-color: rgba(0, 0, 0, 0.6);
  z-index: 1000;
`

const Popup = styled(motion.div)`
  border-radius: var(--radius);
  margin: auto;
  width: 30vw;
  min-width: 300px;
  max-height: 500px;
  overflow-x: hidden;
  overflow-y: auto;
  box-shadow: var(--shadow);
  background-color: ${({ theme }) => theme.bg.primary};
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

const SelectOptionsHeader = styled.header`
  padding: var(--spacing-1) var(--spacing-3);
  border-bottom: 1px solid ${({ theme }) => theme.border.primary};
  background-color: ${({ theme }) => theme.bg.secondary};
  display: flex;
  align-items: center;
`

export const Form = styled.form`
  display: flex;
  flex: 1;
  width: 100%;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`
