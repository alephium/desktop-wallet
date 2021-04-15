import { HTMLMotionProps, motion, Variants } from 'framer-motion'
import React from 'react'
import styled from 'styled-components'

type InputProps = HTMLMotionProps<'input'>

const variants: Variants = {
  hidden: { y: 10, opacity: 0 },
  shown: { y: 0, opacity: 1 }
}

export const Input = ({ placeholder, ...props }: InputProps) => (
  <StyledInput {...props} placeholder={placeholder} variants={variants} />
)

// === Styling

const StyledInput = styled(motion.input)`
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

  margin: 15px 0;

  &:focus {
    background-color: ${({ theme }) => theme.bg.primary};
    border: 3px solid ${({ theme }) => theme.global.accent};
  }
`
