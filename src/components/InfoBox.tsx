import styled, { css, useTheme } from 'styled-components'
import { LucideProps } from 'lucide-react'
import { motion, Variants } from 'framer-motion'

interface InfoBoxProps {
  text: string
  Icon?: (props: LucideProps) => JSX.Element
  label?: string
  importance?: 'accent' | 'alert'
  className?: string
  ellipsis?: boolean
  wordBreak?: boolean
  onClick?: () => void
  small?: boolean
}

const variants: Variants = {
  hidden: { y: 10, opacity: 0 },
  shown: { y: 0, opacity: 1 }
}

export const InfoBox = ({
  Icon,
  text,
  label,
  importance,
  className,
  ellipsis,
  wordBreak,
  onClick,
  small
}: InfoBoxProps) => {
  const theme = useTheme()

  return (
    <BoxContainer className={className} onClick={onClick} small={small}>
      {label && <Label variants={variants}>{label}</Label>}
      <StyledBox variants={variants} importance={importance}>
        {Icon && (
          <IconContainer>
            <Icon color={importance ? theme.global[importance] : theme.global.accent} strokeWidth={1.5} />
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
const BoxContainer = styled.div<{ small?: boolean }>`
  width: 100%;
  margin: 0 auto 20px auto;
  margin-top: 10px;
  max-width: ${({ small }) => (small ? '300px' : 'initial')};
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

const StyledBox = styled(motion.div)<{ importance?: 'accent' | 'alert' }>`
  padding: 10px 20px 10px 0;
  background-color: ${({ theme }) => theme.bg.primary};
  border: 1px solid ${({ theme, importance }) => (importance === 'alert' ? theme.global.alert : theme.border.secondary)};
  display: flex;
  border-radius: 7px;
  box-shadow: 0 5px 5px rgba(0, 0, 0, 0.05);
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
