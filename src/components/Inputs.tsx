import { AnimatePresence, HTMLMotionProps, motion, Variants } from 'framer-motion'
import styled from 'styled-components'
import tinycolor from 'tinycolor2'
import classNames from 'classnames'
import { useState, ChangeEvent, useRef } from 'react'
import { Check, ChevronDown } from 'lucide-react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
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
  up: { y: -35, scale: 0.8 },
  down: { y: 0, scale: 1 }
}

export const Input = ({
  placeholder,
  error,
  isValid,
  disabled,
  onChange,
  value: initialValue,
  ...props
}: InputProps) => {
  const [canBeAnimated, setCanBeAnimated] = useState(false)
  const [value, setValue] = useState(initialValue)

  const className = classNames({
    error,
    isValid
  })

  const handleValueChange = (e: ChangeEvent<HTMLInputElement>): void => {
    onChange && onChange(e)
    setValue(e.target.value)
  }

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
      <StyledInput {...props} value={value} onChange={handleValueChange} className={className} disabled={disabled} />
      {!disabled && isValid && (
        <ValidIconContainer initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          <Check strokeWidth={3} />
        </ValidIconContainer>
      )}
      {!disabled && error && <ErrorMessage animate={{ y: 10, opacity: 1 }}>{error}</ErrorMessage>}
    </InputContainer>
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
  onValueChange: (value: SelectOption | undefined) => void
}

export const Select = ({ options, placeholder, disabled, initialValue, className, onValueChange }: SelectProps) => {
  const [canBeAnimated, setCanBeAnimated] = useState(false)
  const [value, setValue] = useState(initialValue)
  const [showPopup, setShowPopup] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // If only one value, select it
  if (!value && options.length === 1) {
    setValue(options[0])
  }

  const setInputValue = (option: SelectOption) => {
    onValueChange && onValueChange(option)
    setValue(option)

    // Set value in input
    if (inputRef.current && option) {
      inputRef.current.value = option.label
    }
  }

  return (
    <>
      <InputContainer
        variants={variants}
        animate={canBeAnimated ? (!disabled ? 'shown' : 'disabled') : false}
        onAnimationComplete={() => setCanBeAnimated(true)}
        custom={disabled}
        onClick={() => setShowPopup(true)}
      >
        <Label variants={placeHolderVariants} animate={!value ? 'down' : 'up'}>
          {placeholder}
        </Label>
        <Chevron>
          <ChevronDown />
        </Chevron>
        <StyledInput type="button" className={className} ref={inputRef} disabled={disabled} />
      </InputContainer>
      <AnimatePresence>
        {showPopup && (
          <SelectOptionsPopup
            options={options}
            setValue={setInputValue}
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
  handleBackgroundClick
}: {
  options: SelectOption[]
  setValue: (value: SelectOption) => void | undefined
  handleBackgroundClick: () => void
}) => {
  const handleOptionSelect = (value: SelectOption) => {
    setValue(value)
    handleBackgroundClick()
  }

  return (
    <PopupContainer
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      onClick={() => {
        handleBackgroundClick()
      }}
    >
      <Popup
        onClick={(e) => {
          e.stopPropagation()
        }}
      >
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
  height: 50px;
  width: 100%;
  margin: 17px 0;
`

const Label = styled(motion.label)`
  position: absolute;
  top: 15px;
  left: 18px;
  font-weight: 600;
  color: ${({ theme }) => theme.font.secondary};
  pointer-events: none;
`

const ErrorMessage = styled(motion.label)<InputProps>`
  position: absolute;
  bottom: -10px;
  right: 10px;
  font-weight: 600;
  opacity: 0;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.global.alert};
`

const ValidIconContainer = styled(motion.div)`
  position: absolute;
  top: 0;
  bottom: 0;
  right: 20px;
  font-weight: 600;
  display: flex;
  align-items: center;
  color: ${({ theme }) => theme.global.valid};
`

const StyledInput = styled.input<InputProps>`
  background-image: none;
  height: 50px;
  width: 100%;
  border-radius: 100px;
  background-color: ${({ theme }) => theme.bg.secondary};
  border: 3px solid ${({ theme }) => theme.border.primary};
  padding: 0 15px;
  font-weight: 600;
  font-size: 1em;
  text-align: left;

  transition: 0.2s ease-out;

  &:focus {
    background-color: ${({ theme }) => theme.bg.primary};
    border: 3px solid ${({ theme }) => theme.global.accent};
  }

  &.error {
    border: 3px solid ${({ theme }) => theme.global.alert};
    background-color: ${({ theme }) => tinycolor(theme.global.alert).setAlpha(0.1).toString()};
  }

  &:disabled {
    background-color: ${({ theme }) => theme.bg.secondary};
    border: 3px solid ${({ theme }) => theme.border.primary};
  }
`

const Chevron = styled.div`
  position: absolute;
  font-size: 1.3rem;
  top: 16px;
  right: 18px;
  color: ${({ theme }) => theme.font.secondary};
`

const PopupContainer = styled(motion.div)`
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  display: flex;
  background-color: rgba(0, 0, 0, 0.1);
  z-index: 1000;
`

const Popup = styled.div`
  background-color: ${({ theme }) => theme.bg.primary};
  border-radius: 14px;
  margin: auto;
  width: 30vw;
  min-width: 300px;
  max-height: 500px;
  overflow-x: hidden;
  overflow-y: auto;
`

const OptionItem = styled.div`
  padding: 15px;
  cursor: pointer;

  &:not(:last-child) {
    border-bottom: 1px solid ${({ theme }) => theme.border.primary};
  }

  &:hover {
    background-color: ${({ theme }) => theme.bg.secondary};
  }
`

export const Form = styled.form`
  display: flex;
  flex: 1;
  width: 100%;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`
