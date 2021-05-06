import styled, { useTheme } from 'styled-components'
import { LucideProps } from 'lucide-react'
import { motion, Variants } from 'framer-motion'

interface InfoBoxProps {
  text: string
  Icon?: (props: LucideProps) => JSX.Element
  label?: string
  iconColor?: string
  className?: string
  ellipsis?: boolean
  onClick?: () => void
}

const variants: Variants = {
  hidden: { y: 10, opacity: 0 },
  shown: { y: 0, opacity: 1 }
}

export const InfoBox = ({ Icon, text, label, iconColor, className, ellipsis, onClick }: InfoBoxProps) => {
  const theme = useTheme()

  return (
    <BoxContainer className={className} onClick={onClick}>
      {label && <Label variants={variants}>{label}</Label>}
      <StyledBox variants={variants}>
        {Icon && (
          <IconContainer>
            <Icon color={iconColor || theme.global.alert} strokeWidth={1.5} />
          </IconContainer>
        )}
        <TextContainer style={ellipsis ? { overflow: 'hidden', textOverflow: 'ellipsis' } : {}}>{text}</TextContainer>
      </StyledBox>
    </BoxContainer>
  )
}

// === Styling === //
const BoxContainer = styled.div`
  width: 100%;
  margin-bottom: 20px;
`

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
  padding: 0 20px;
  flex: 2;
  font-weight: 600;
  vertical-align: center;
`

const StyledBox = styled(motion.div)`
  padding: 10px 20px 10px 0;
  background-color: ${({ theme }) => theme.bg.secondary};
  display: flex;
  border-radius: 14px;
`

const Label = styled(motion.label)`
  display: block;
  width: 100%;
  margin-left: 15px;
  margin-bottom: 7px;
  color: ${({ theme }) => theme.font.secondary};
  font-weight: 600;
`
