import { motion, MotionStyle, useTransform, useViewportScroll, Variants } from 'framer-motion'
import React, { FC } from 'react'
import styled from 'styled-components'
import { ArrowLeft } from 'lucide-react'

export const MainContainer = styled.div`
  height: 100%;
  max-width: 700px;
  margin: 0 auto;
  padding: 0 30px;
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  flex-direction: column;
`

export const PageContainer = styled.section`
  flex: 1;
  display: flex;
  flex-direction: column;
`

const contentVariants: Variants = {
  hidden: { opacity: 0 },
  shown: (apparitionDelay = 0) => ({
    opacity: 1,
    transition: {
      when: 'beforeChildren',
      delay: apparitionDelay,
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  }),
  out: {
    opacity: 0
  }
}

interface ContentProps {
  apparitionDelay?: number
  style?: MotionStyle
  className?: string
}

export const SectionContent: React.FC<ContentProps> = ({ children, apparitionDelay, style, className }) => {
  return (
    <StyledContent
      variants={contentVariants}
      initial="hidden"
      animate="shown"
      exit="hidden"
      custom={apparitionDelay}
      style={style}
      className={className}
    >
      {children}
    </StyledContent>
  )
}

export const StyledContent = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  flex: 1;

  &:not(:last-child) {
    margin-bottom: 25px;
  }
`

interface SectionTitleProps {
  color?: string
  onBackButtonPress?: () => void
  smaller?: boolean
  backgroundColor?: string
  useLayoutId?: boolean
}

export const FooterActions = styled(SectionContent)`
  flex: 0;
  margin-bottom: 5vh;
`

// ===========
// == Title ==
// ===========

export const PageTitle: FC<SectionTitleProps> = ({
  color,
  children,
  onBackButtonPress,
  smaller,
  backgroundColor,
  useLayoutId = true
}) => {
  const { scrollY } = useViewportScroll()

  const titleScale = useTransform(scrollY, [0, 50], [1, 0.6])

  return (
    <TitleContainer style={{ backgroundColor: backgroundColor || 'white' }}>
      {onBackButtonPress && <BackArrow onClick={onBackButtonPress} strokeWidth={3} />}
      <H1
        color={color}
        layoutId={useLayoutId ? 'sectionTitle' : ''}
        smaller={smaller}
        style={{ scale: titleScale, originX: 0 }}
      >
        {children}
      </H1>
    </TitleContainer>
  )
}

export const TitleContainer = styled.div`
  display: flex;
  align-items: center;
  margin-top: 3vh;
  margin-bottom: 4vh;
  position: sticky;
  top: 0;
  z-index: 1;
`

const BackArrow = styled(ArrowLeft)`
  height: 47px;
  width: 20px;
  margin-right: 20px;
  cursor: pointer;
`

const H1 = styled(motion.h1)<{ color?: string; smaller?: boolean }>`
  flex: 1;
  margin: 0;
  color: ${({ theme, color }) => (color ? color : theme.font.primary)};
  font-size: ${({ smaller }) => (smaller ? '2.0rem' : 'auto')};
`
