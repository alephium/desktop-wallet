import React from 'react'
import styled from 'styled-components'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {

}

export const Input = ({ placeholder } : InputProps) => {
  return (
    <StyledInput placeholder={placeholder} />
  )
}

// === Styling

const StyledInput = styled.input`
  background-image:none;
  height: 50px;
  border-radius: 100px;
	background-color: ${({theme}) => theme.bg.secondary};
	border: 3px solid ${({theme}) => theme.border.primary };
	padding: 0 15px;

	transition: 0.2s ease-out;

	margin: 15px 0;

	&:focus {
		background-color: ${({theme}) => theme.bg.primary};
		border: 3px solid ${({theme}) => theme.global.accent };
	}
`