import { HTMLMotionProps, motion, Variants } from 'framer-motion'
import styled from 'styled-components'
import tinycolor from 'tinycolor2'

interface InputProps extends HTMLMotionProps<'input'> {
  error?: string
  valid?: string
}

const variants: Variants = {
  hidden: { y: 10, opacity: 0 },
  shown: { y: 0, opacity: 1 }
}

export const Input = ({ placeholder, error, valid, ...props }: InputProps) => {
  return (
    <InputContainer>
      <StyledInput
        {...props}
        placeholder={placeholder}
        variants={variants}
        className={error ? 'error' : valid ? 'valid' : ''}
      />
      {(error || valid) && <Label>{error || valid}</Label>}
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
`
