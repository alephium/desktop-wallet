import { HTMLMotionProps, motion, Variants } from 'framer-motion'
import React, { useState } from 'react'
import styled from 'styled-components'
import tinycolor from 'tinycolor2'

interface ButtonProps extends HTMLMotionProps<'button'> {
  secondary?: boolean
  disabled?: boolean
  transparent?: boolean
  squared?: boolean
}

const variants: Variants = {
  hidden: { y: 10, opacity: 0 },
  shown: (disabled) => ({ y: 0, opacity: disabled ? 0.5 : 1 }),
  disabled: { y: 0, opacity: 0.5 }
}

export const Button = ({ children, disabled, ...props }: ButtonProps) => {
  const [canBeAnimated, setCanBeAnimateds] = useState(false)

  return (
    <StyledButton
      {...props}
      variants={variants}
      custom={disabled}
      disabled={disabled}
      animate={canBeAnimated ? (!disabled ? 'shown' : 'disabled') : false}
      onAnimationComplete={() => setCanBeAnimateds(true)}
    >
      {children}
    </StyledButton>
  )
}

// === Styling

const StyledButton = styled(motion.button)<ButtonProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 50px;
  width: ${({ squared }) => (squared ? '50px' : '80%')};
  border-radius: 7px;
  border: none;
  background-color: ${({ theme, secondary, transparent }) =>
    transparent ? 'transparent' : secondary ? theme.bg.secondary : theme.global.accent};
  color: ${({ theme, secondary }) => (secondary ? theme.global.accent : theme.font.contrast)};
  font-weight: 600;
  font-size: 1.1rem;
  padding: 0 15px;
  min-width: ${({ squared }) => (squared ? '50px' : '100px')};
  text-align: center;
  cursor: pointer;

  transition: 0.2s ease-out;

  margin: 15px 0;

  &:hover {
    background-color: ${({ theme, secondary }) =>
      secondary
        ? tinycolor(theme.bg.tertiary).darken(20).toString()
        : tinycolor(theme.global.accent).darken(10).toString()};
  }

  &:active {
    background-color: ${({ theme, secondary }) =>
      secondary
        ? tinycolor(theme.bg.tertiary).darken(40).toString()
        : tinycolor(theme.global.accent).darken(20).toString()};
  }

  pointer-events: ${({ disabled: deactivated }) => (deactivated ? 'none' : 'auto')};

  &:focus-visible {
    box-shadow: 0 0 0 3px ${({ theme }) => tinycolor(theme.global.accent).darken(20).toString()};
  }
`
