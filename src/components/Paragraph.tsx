import { HTMLMotionProps, motion, Variants } from 'framer-motion'
import { FC } from 'react'
import styled from 'styled-components'

const variants: Variants = {
  hidden: { y: 10, opacity: 0 },
  shown: { y: 0, opacity: 1 }
}

const Paragraph: FC<HTMLMotionProps<'p'>> = ({ children, className }) => {
  return (
    <StyledParagraph variants={variants} className={className}>
      {children}
    </StyledParagraph>
  )
}

const StyledParagraph = styled(motion.p)`
  white-space: pre-wrap;
`

export default Paragraph
