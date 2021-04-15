import { HTMLMotionProps, motion, Variants } from 'framer-motion'
import styled from 'styled-components'
import tinycolor from 'tinycolor2'
import classNames from 'classnames'
import { useState, ChangeEvent } from 'react'

interface InputProps extends HTMLMotionProps<'input'> {
  error?: string
  valid?: string
  disabled?: boolean
}

const variants: Variants = {
  hidden: { y: 10, opacity: 0 },
  shown: (disabled) => ({ y: 0, opacity: disabled ? 0.5 : 1 }),
  disabled: { y: 0, opacity: 0.5 }
}

export const Input = ({ placeholder, error, valid, disabled, onChange, ...props }: InputProps) => {
  const [canBeAnimated, setCanBeAnimateds] = useState(false)
  const [value, setValue] = useState('')

  const className = classNames({
    error,
    valid
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
      {!disabled && (error || valid) && <Message animate={{ y: 10, opacity: 1 }}>{error || valid}</Message>}
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
`

const Message = styled(motion.label)<InputProps>`
  position: absolute;
  bottom: -10px;
  right: 10px;
  font-weight: 600;
  opacity: 0;
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

    & + ${Message} {
      color: ${({ theme }) => theme.global.alert};
    }
  }

  &.valid {
    border: 3px solid ${({ theme }) => theme.global.valid};
    background-color: ${({ theme }) => tinycolor(theme.global.valid).setAlpha(0.1).toString()};

    & + ${Message} {
      color: ${({ theme }) => theme.global.valid};
    }
  }

  &:disabled {
    background-color: ${({ theme }) => theme.bg.secondary};
    border: 3px solid ${({ theme }) => theme.border.primary};
  }
`
