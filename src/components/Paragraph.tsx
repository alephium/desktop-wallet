import { HTMLMotionProps, motion, Variants } from 'framer-motion'
import { FC } from 'react'
import styled from 'styled-components'

const variants: Variants = {
  hidden: { y: 10, opacity: 0 },
  shown: { y: 0, opacity: 1 }
}

const Paragraph: FC<HTMLMotionProps<'p'>> = ({ children, className, style, ...props }) => {
  return (
    <StyledParagraph variants={variants} className={className} style={style} {...props}>
      {children}
    </StyledParagraph>
  )
}

const StyledParagraph = styled(motion.p)`
  white-space: pre-wrap;
  font-weight: 500;
`

export const CenteredMainParagraph = styled(Paragraph)`
  text-align: center;
`

export const CenteredSecondaryParagraph = styled(Paragraph)`
  text-align: center;
  color: ${({ theme }) => theme.font.secondary};
`

export default Paragraph
