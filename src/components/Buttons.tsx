import { HTMLMotionProps, motion, Variants } from 'framer-motion'
import React from 'react'
import styled from 'styled-components'
import tinycolor from 'tinycolor2'

interface ButtonProps extends HTMLMotionProps<'button'> {
  secondary?: boolean
  deactivated?: boolean
}

const variants: Variants = {
  hidden: { y: 10, opacity: 0 },
  shown: { y: 0, opacity: 1 }
}

export const Button = ({ children, ...props }: ButtonProps) => {
  return (
    <StyledButton {...props} variants={variants}>
      {children}
    </StyledButton>
  )
}

// === Styling

const StyledButton = styled(motion.button)<ButtonProps>`
  height: 50px;
  width: 80%;
  border-radius: 7px;
  border: none;
  background-color: ${({ theme, secondary }) => (secondary ? theme.bg.tertiary : theme.global.accent)};
  color: ${({ theme, secondary }) => (secondary ? theme.font.secondary : theme.font.contrast)};
  font-weight: 600;
  font-size: 1.1rem;
  padding: 0 15px;
  min-width: 100px;
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

  opacity: ${({ deactivated }) => (deactivated ? 0.5 : 1)} !important;
  pointer-events: ${({ deactivated }) => (deactivated ? 'none' : 'auto')};

  &:focus-visible {
    box-shadow: 0 0 0 3px ${({ theme }) => tinycolor(theme.global.accent).darken(20).toString()};
  }
`
