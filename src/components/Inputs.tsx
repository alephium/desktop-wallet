import { HTMLMotionProps, motion, Variants } from 'framer-motion'
import styled from 'styled-components'
import tinycolor from 'tinycolor2'
import classNames from 'classnames'
import { useState } from 'react'

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

export const Input = ({ placeholder, error, valid, disabled, ...props }: InputProps) => {
  const [canBeAnimated, setCanBeAnimateds] = useState(false)
  const className = classNames({
    error,
    valid
  })
  console.log(canBeAnimated)
  return (
    <InputContainer>
      <StyledInput
        {...props}
        placeholder={placeholder}
        variants={variants}
        className={className}
        disabled={disabled}
        custom={disabled}
        animate={canBeAnimated ? (!disabled ? 'shown' : 'disabled') : false}
        onAnimationComplete={() => setCanBeAnimateds(true)}
      />
      {!disabled && (error || valid) && <Label>{error || valid}</Label>}
    </InputContainer>
  )
}

// === Styling

const InputContainer = styled.div`
  position: relative;
  height: 50px;
  width: 100%;
  margin: 15px 0;
`

const Label = styled.label<InputProps>`
  position: absolute;
  bottom: 0;
  left: 10px;
  font-weight: 600;
  transform: translateY(110%);
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

    & + ${Label} {
      color: ${({ theme }) => theme.global.alert};
    }
  }

  &.valid {
    border: 3px solid ${({ theme }) => theme.global.valid};
    background-color: ${({ theme }) => tinycolor(theme.global.valid).setAlpha(0.1).toString()};

    & + ${Label} {
      color: ${({ theme }) => theme.global.valid};
    }
  }

  &:disabled {
    background-color: ${({ theme }) => theme.bg.secondary};
    border: 3px solid ${({ theme }) => theme.border.primary};
  }
`
