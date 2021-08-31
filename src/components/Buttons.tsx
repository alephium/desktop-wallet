import { HTMLMotionProps, motion, Variants } from 'framer-motion'
import React, { useState } from 'react'
import styled from 'styled-components'
import tinycolor from 'tinycolor2'

interface ButtonProps extends HTMLMotionProps<'button'> {
  secondary?: boolean
  alert?: boolean
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
  const [canBeAnimated, setCanBeAnimateds] = useState(props.squared ? true : false)

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
  height: 46px;
  width: ${({ squared }) => (squared ? '46px' : '80%')};
  border-radius: ${({ squared }) => (squared ? '100%' : '7px')};
  border: none;
  background-color: ${({ theme, secondary, transparent, alert }) =>
    alert && !secondary
      ? theme.global.alert
      : transparent
      ? 'transparent'
      : secondary
      ? theme.bg.secondary
      : theme.global.accent};
  color: ${({ theme, secondary, alert }) =>
    alert && secondary
      ? theme.global.alert
      : alert
      ? theme.font.contrast
      : secondary
      ? theme.global.accent
      : theme.font.contrast};
  font-weight: 600;
  font-size: 1.1rem;
  padding: 0 13px;
  min-width: ${({ squared }) => (squared ? '46px' : '100px')};
  text-align: center;
  cursor: pointer;

  transition: 0.2s ease-out;

  margin: 12px 0;

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
