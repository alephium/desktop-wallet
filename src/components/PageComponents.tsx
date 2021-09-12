import { motion, MotionStyle, useTransform, useViewportScroll, Variants } from 'framer-motion'
import React, { FC } from 'react'
import styled from 'styled-components'
import { ArrowLeft } from 'lucide-react'

export const MainPanelContainer = styled.main<{ verticalAlign?: 'center' | 'flex-start' }>`
  height: 100%;
  width: 100%;
  margin: 0 auto;
  max-width: 600px;
  padding: 0 20px;
  display: flex;
  flex-direction: column;
  justify-content: ${({ verticalAlign }) => verticalAlign || 'flex-start'};
`

export const PageContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
`

const contentVariants: Variants = {
  hidden: { opacity: 0 },
  shown: (apparitionDelay = 0) => ({
    opacity: 1,
    transition: {
      duration: 0,
      when: 'beforeChildren',
      delay: apparitionDelay,
      staggerChildren: 0.05,
      delayChildren: 0.05
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
  inList?: boolean
}

export const SectionContent: React.FC<ContentProps> = ({ children, apparitionDelay, inList, style, className }) => {
  return (
    <StyledContent
      variants={contentVariants}
      initial="hidden"
      animate="shown"
      exit="hidden"
      custom={apparitionDelay}
      style={style}
      className={className}
      inList={inList}
    >
      {children}
    </StyledContent>
  )
}

export const StyledContent = styled(motion.div)<{ inList?: boolean }>`
  display: flex;
  align-items: center;
  flex-direction: column;

  margin-top: ${({ inList }) => (inList ? '25px' : '0')};
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
  margin-top: 25px;
  width: 100%;
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
    <TitleContainer
      style={{ backgroundColor: backgroundColor || 'white' }}
      layoutId={useLayoutId ? 'sectionTitle' : ''}
    >
      {onBackButtonPress && <BackArrow onClick={onBackButtonPress} strokeWidth={3} />}
      <H1 color={color} smaller={smaller} style={{ scale: titleScale, originX: 0 }}>
        {children}
      </H1>
    </TitleContainer>
  )
}

export const TitleContainer = styled(motion.div)`
  display: flex;
  align-items: center;
  margin-top: 10px;
  margin-bottom: 15px;
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
  font-weight: 600;
`
