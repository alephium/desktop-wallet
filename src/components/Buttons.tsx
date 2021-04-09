import React from 'react'
import styled from 'styled-components'
import tinycolor from 'tinycolor2'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLInputElement> {
  children: string
}

export const Button = ({ children }: ButtonProps) => {
  return <StyledButton>{children}</StyledButton>
}

// === Styling

const StyledButton = styled.button`
  height: 50px;
  border-radius: 100px;
  border: none;
  background-color: ${({ theme }) => theme.global.accent};
  color: ${({ theme }) => theme.font.contrast};
  font-weight: 600;
  font-size: 1.1rem;
  padding: 0 15px;
  min-width: 100px;
  text-align: center;
  cursor: pointer;

  transition: 0.2s ease-out;

  margin: 15px 0;

  &:hover {
    background-color: ${({ theme }) => tinycolor(theme.global.accent).darken(10).toString()};
  }

  &:active {
    background-color: ${({ theme }) => tinycolor(theme.global.accent).darken(20).toString()};
  }

  &:focus-visible {
    box-shadow: 0 0 0 3px ${({ theme }) => tinycolor(theme.global.accent).darken(20).toString()};
  }
`
