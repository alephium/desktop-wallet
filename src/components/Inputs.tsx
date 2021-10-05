import { AnimatePresence, HTMLMotionProps, motion, Variants } from 'framer-motion'
import styled, { css } from 'styled-components'
import tinycolor from 'tinycolor2'
import classNames from 'classnames'
import { useState, useRef, useEffect, useCallback } from 'react'
import { Check, MoreVertical } from 'lucide-react'
import Tags from '@yaireo/tagify/dist/react.tagify'

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
      <Label variants={placeHolderVariants} animate={!value ? 'down' : 'up'}>
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

interface SelectOption {
  value: string
  label: string
}

interface SelectProps extends HTMLMotionProps<'select'> {
  initialValue?: SelectOption
  options: SelectOption[]
  title?: string
  onValueChange: (value: SelectOption | undefined) => void
}

export const Select = ({
  options,
  title,
  placeholder,
  disabled,
  initialValue,
  className,
  onValueChange
}: SelectProps) => {
  const [canBeAnimated, setCanBeAnimated] = useState(false)
  const [value, setValue] = useState(initialValue)
  const [showPopup, setShowPopup] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const setInputValue = useCallback(
    (option: SelectOption) => {
      onValueChange && onValueChange(option)
      setValue(option)

      // Set value in input
      if (inputRef.current && option) {
        inputRef.current.value = option.label
      }
    },
    [onValueChange]
  )

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
        <Label variants={placeHolderVariants} animate={!value ? 'down' : 'up'}>
          {placeholder}
        </Label>
        <MoreIcon>
          <MoreVertical />
        </MoreIcon>
        <StyledInput type="button" className={className} ref={inputRef} disabled={disabled} />
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

const SelectOptionsPopup = ({
  options,
  setValue,
  handleBackgroundClick,
  title
}: {
  options: SelectOption[]
  setValue: (value: SelectOption) => void | undefined
  handleBackgroundClick: () => void
  title?: string
}) => {
  const handleOptionSelect = (value: SelectOption) => {
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
          <OptionItem key={o.value} onClick={() => handleOptionSelect(o)}>
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
  margin: 15px 0;
`

const TextAreaContainer = styled(motion.div)`
  position: relative;
  width: 100%;
  margin: 15px 0;
`

const TextAreaTagsContainer = styled(motion.div)`
  width: 100%;
  margin: 15px 0;
  border-radius: 7px;
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
  font-weight: 500;
  color: ${({ theme }) => theme.font.secondary};
  pointer-events: none;
`

const ErrorMessage = styled(motion.label)<InputProps>`
  position: absolute;
  bottom: -7px;
  right: 10px;
  font-weight: 500;
  opacity: 0;
  font-size: 0.8em;
  color: ${({ theme }) => theme.global.alert};
`

const ValidIconContainer = styled(motion.div)`
  position: absolute;
  top: 0;
  bottom: 0;
  right: 20px;
  font-weight: 500;
  display: flex;
  align-items: center;
  color: ${({ theme }) => theme.global.valid};
`

const defaultStyle = (isValid?: boolean) => {
  return css`
    background-image: none;
    height: 46px;
    width: 100%;
    border-radius: 7px;
    background-color: ${({ theme }) => theme.bg.secondary};
    border: 1px solid ${({ theme }) => theme.border.primary};
    color: ${({ theme }) => theme.font.primary};
    padding: ${isValid ? '0 45px 0 12px' : '0 12px'};
    font-weight: 500;
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
  border-radius: 7px;
`

// NOTE: Tags dropdown is styled in GlobalStyles

const StyledTags = styled(Tags)`
  ${defaultStyle(true)}
  height: auto;
  padding: 5px;
  line-height: 20px;
  border-radius: 7px;
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
  border-radius: 7px;
  margin: auto;
  width: 30vw;
  min-width: 300px;
  max-height: 500px;
  overflow-x: hidden;
  overflow-y: auto;
  box-shadow: 0 15px 15px rgba(0, 0, 0, 0.15);
  background-color: ${({ theme }) => theme.bg.primary};
`

const OptionItem = styled.div`
  padding: 15px;
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
  padding: 5px 15px;
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
