/*
Copyright 2018 - 2022 The Alephium Authors
This file is part of the alephium project.

The library is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with the library. If not, see <http://www.gnu.org/licenses/>.
*/

import { motion, MotionStyle, Variants } from 'framer-motion'
import { FC } from 'react'
import styled from 'styled-components'

import { appHeaderHeight, deviceBreakPoints, walletSidebarWidth } from '../../style/globalStyles'
import Tooltip from '../Tooltip'

interface MainPanelProps {
  verticalAlign?: 'center' | 'flex-start'
  horizontalAlign?: 'center' | 'stretch'
  enforceMinHeight?: boolean
  transparentBg?: boolean
}

type SectionContentAlignment = 'flex-start' | 'center' | 'stretch'

interface SectionProps {
  apparitionDelay?: number
  style?: MotionStyle
  className?: string
  inList?: boolean
  align?: SectionContentAlignment
}

const sectionVariants: Variants = {
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

export const sectionChildrenVariants: Variants = {
  hidden: { y: 5, opacity: 0 },
  shown: (disabled) => ({ y: 0, opacity: disabled ? 0.5 : 1 }),
  disabled: { y: 0, opacity: 0.5 }
}

export const FloatingPanel: FC<MainPanelProps> = ({ children, ...props }) => (
  <StyledFloatingPanel initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} {...props}>
    {children}
  </StyledFloatingPanel>
)

export const Section: FC<SectionProps> = ({
  children,
  apparitionDelay,
  inList,
  align = 'center',
  style,
  className
}) => (
  <SectionContainer
    variants={sectionVariants}
    initial="hidden"
    animate="shown"
    exit="hidden"
    custom={apparitionDelay}
    inList={inList}
    align={align}
    style={style}
    className={className}
  >
    {children}
  </SectionContainer>
)

export const BoxContainer: FC = ({ children }) => (
  <StyledBoxContainer variants={sectionChildrenVariants}>{children}</StyledBoxContainer>
)

const StyledFloatingPanel = styled(motion.div)<MainPanelProps>`
  width: 100%;
  margin: 0 auto;
  max-width: 600px;
  min-height: ${({ enforceMinHeight }) => (enforceMinHeight ? '600px' : 'initial')};
  padding: var(--spacing-5);
  display: flex;
  flex-direction: column;
  justify-content: ${({ verticalAlign }) => verticalAlign || 'flex-start'};
  align-items: ${({ horizontalAlign }) => horizontalAlign || 'stretch'};
  background-color: ${({ theme, transparentBg }) => !transparentBg && theme.bg.primary};
  border-radius: var(--radius);
  box-shadow: ${({ transparentBg }) => !transparentBg && '0 2px 2px var(--color-shadow-10)'};

  @media ${deviceBreakPoints.mobile} {
    box-shadow: none;
    max-width: initial;
  }

  @media ${deviceBreakPoints.short} {
    box-shadow: none;
  }
`

export const PanelContentContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`

export const SectionContainer = styled(motion.div)<{ align: SectionContentAlignment; inList?: boolean }>`
  display: flex;
  align-items: ${({ align }) => align};
  flex-direction: column;
  min-width: 400px;

  margin-top: ${({ inList }) => (inList ? 'var(--spacing-5)' : '0')};
`

const StyledBoxContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.bg.secondary};
  border-radius: var(--radius);
  width: 100%;
`

export const FooterActionsContainer = styled(Section)`
  flex: 0;
  margin-top: var(--spacing-5);
  width: 100%;
`

export let MainContent: FC = ({ children, ...props }) => (
  <motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} {...props}>
    <Tooltip />
    {children}
  </motion.main>
)

MainContent = styled(MainContent)`
  position: absolute;
  left: ${walletSidebarWidth}px;
  right: 0;
  display: flex;
  flex-direction: column;
  padding: 56px;
  padding-top: calc(10px + ${appHeaderHeight});
  background-color: ${({ theme }) => theme.bg.secondary};
  min-height: 100vh;

  @media ${deviceBreakPoints.mobile} {
    position: relative;
    overflow: initial;
    padding: var(--spacing-5);
    left: 0;
  }
`

export const PageTitleRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
`
