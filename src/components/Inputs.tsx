import { HTMLMotionProps, motion, Variants } from 'framer-motion'
import styled from 'styled-components'
import tinycolor from 'tinycolor2'
import classNames from 'classnames'
import { useState, ChangeEvent } from 'react'
import { FiCheck } from 'react-icons/fi'

interface InputProps extends HTMLMotionProps<'input'> {
  error?: string
  isValid?: boolean
  disabled?: boolean
}

const variants: Variants = {
  hidden: { y: 10, opacity: 0 },
  shown: (disabled) => ({ y: 0, opacity: disabled ? 0.5 : 1 }),
  disabled: { y: 0, opacity: 0.5 }
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
  const [canBeAnimated, setCanBeAnimateds] = useState(false)
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
    <InputContainer>
      {value && <Label animate={{ y: -20, opacity: 1, scale: 0.8 }}>{placeholder}</Label>}
      <StyledInput
        {...props}
        value={value}
        onChange={handleValueChange}
        placeholder={placeholder}
        variants={variants}
        className={className}
        disabled={disabled}
        custom={disabled}
        animate={canBeAnimated ? (!disabled ? 'shown' : 'disabled') : false}
        onAnimationComplete={() => setCanBeAnimateds(true)}
      />
      {!disabled && isValid && (
        <ValidIconContainer initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          <FiCheck strokeWidth={3} />
        </ValidIconContainer>
      )}
      {!disabled && error && <ErrorMessage animate={{ y: 10, opacity: 1 }}>{error}</ErrorMessage>}
    </InputContainer>
  )
}

// === Styling

const InputContainer = styled.div`
  position: relative;
  height: 50px;
  width: 100%;
  margin: 17px 0;
`

const Label = styled(motion.label)`
  position: absolute;
  top: 0;
  left: 15px;
  font-weight: 600;
  opacity: 0;
  color: ${({ theme }) => theme.font.secondary};
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

const StyledInput = styled(motion.input)<InputProps>`
  background-image: none;
  height: 50px;
  width: 100%;
  border-radius: 100px;
  background-color: ${({ theme }) => theme.bg.secondary};
  border: 3px solid ${({ theme }) => theme.border.primary};
  padding: 0 15px;
  font-weight: 600;
  font-size: 1em;

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
