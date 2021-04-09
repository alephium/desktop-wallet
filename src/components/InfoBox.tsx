import React from 'react'
import styled from 'styled-components'
import { IconType } from 'react-icons'
import { motion, Variants } from 'framer-motion'

interface InfoBoxProps {
  Icon: IconType
  text: string
  iconColor?: string
}

const variants: Variants = {
  hidden: { y: 10, opacity: 0 },
  shown: { y: 0, opacity: 1 }
}

export const InfoBox = ({ Icon, text, iconColor }: InfoBoxProps) => {
  return (
    <StyledBox variants={variants}>
      <IconContainer>
        <Icon color={iconColor} strokeWidth={1.5} />
      </IconContainer>
      <TextContainer>{text}</TextContainer>
    </StyledBox>
  )
}

// === Styling === //

const IconContainer = styled.div`
  flex: 1;
  display: flex;

  svg {
    height: 50%;
    width: 50%;
    margin: auto;
  }
`

const TextContainer = styled.p`
  flex: 2;
  font-weight: 600;
`

const StyledBox = styled(motion.div)`
  padding: 10px 20px 10px 0;
  background-color: ${({ theme }) => theme.bg.secondary};
  display: flex;
  border-radius: 7px;
  width: 100%;
  margin: 20px 0;
`
