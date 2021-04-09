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
        <Icon color={iconColor} />
      </IconContainer>
      <TextContainer>{text}</TextContainer>
    </StyledBox>
  )
}

// === Styling === //

const IconContainer = styled.div`
  flex: 1;
`

const TextContainer = styled.p`
  flex: 2;
`

const StyledBox = styled(motion.div)`
  padding: 20px;
  background-color: ${({ theme }) => theme.bg.secondary};
  display: flex;
  border-radius: 7px;
  width: 100%;
  margin: 20px 0;
`
