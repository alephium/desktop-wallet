import React from 'react'
import styled, { useTheme } from 'styled-components'
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
  const theme = useTheme()

  return (
    <StyledBox variants={variants}>
      <IconContainer>
        <Icon color={iconColor || theme.global.alert} strokeWidth={1.5} />
      </IconContainer>
      <TextContainer>{text}</TextContainer>
    </StyledBox>
  )
}

// === Styling === //

const IconContainer = styled.div`
  flex: 1;
  display: flex;
  max-width: 100px;

  svg {
    height: 50%;
    width: 50%;
    margin: auto;
  }
`

const TextContainer = styled.p`
  flex: 2;
  font-weight: 600;
  vertical-align: center;
`

const StyledBox = styled(motion.div)`
  padding: 10px 20px 10px 0;
  background-color: ${({ theme }) => theme.bg.secondary};
  display: flex;
  border-radius: 14px;
  width: 100%;
  margin: 30px 0 20px 0;
`
