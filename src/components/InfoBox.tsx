import styled, { css, useTheme } from 'styled-components'
import { LucideProps } from 'lucide-react'
import { motion, Variants } from 'framer-motion'

interface InfoBoxProps {
  text: string
  Icon?: (props: LucideProps) => JSX.Element
  label?: string
  iconColor?: 'accent' | 'alert'
  className?: string
  ellipsis?: boolean
  wordBreak?: boolean
  onClick?: () => void
}

const variants: Variants = {
  hidden: { y: 10, opacity: 0 },
  shown: { y: 0, opacity: 1 }
}

export const InfoBox = ({ Icon, text, label, iconColor, className, ellipsis, wordBreak, onClick }: InfoBoxProps) => {
  const theme = useTheme()

  return (
    <BoxContainer className={className} onClick={onClick}>
      {label && <Label variants={variants}>{label}</Label>}
      <StyledBox variants={variants}>
        {Icon && (
          <IconContainer>
            <Icon color={iconColor ? theme.global[iconColor] : theme.global.accent} strokeWidth={1.5} />
          </IconContainer>
        )}
        <TextContainer wordBreak={wordBreak} ellipsis={ellipsis}>
          {text}
        </TextContainer>
      </StyledBox>
    </BoxContainer>
  )
}

// === Styling === //
const BoxContainer = styled.div`
  width: 100%;
  margin-bottom: 20px;
  margin-top: 10px;
`

const IconContainer = styled.div`
  flex: 1;
  display: flex;
  max-width: 100px;

  svg {
    height: 30%;
    width: 30%;
    margin: auto;
  }
`

const TextContainer = styled.p<{ wordBreak?: boolean; ellipsis?: boolean }>`
  padding: 0 20px;
  flex: 2;
  font-weight: 500;
  word-break: ${({ wordBreak }) => (wordBreak ? 'break-all' : 'initial')};

  ${({ ellipsis }) => {
    return ellipsis
      ? css`
          overflow: 'hidden';
          textoverflow: 'ellipsis';
        `
      : css`
          overflowwrap: 'anywhere';
        `
  }}
`

const StyledBox = styled(motion.div)`
  padding: 10px 20px 10px 0;
  background-color: ${({ theme }) => theme.bg.secondary};
  display: flex;
  border-radius: 14px;
  align-items: center;
`

const Label = styled(motion.label)`
  display: block;
  width: 100%;
  margin-left: 15px;
  margin-bottom: 7px;
  color: ${({ theme }) => theme.font.secondary};
  font-weight: 500;
`
