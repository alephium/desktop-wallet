/*
Copyright 2018 - 2023 The Alephium Authors
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

import { HTMLMotionProps, motion, MotionStyle, Variants } from 'framer-motion'
import styled, { css } from 'styled-components'

import { fadeIn } from '@/animations'
import Box from '@/components/Box'
import { deviceBreakPoints } from '@/style/globalStyles'

interface MainPanelProps {
  verticalAlign?: 'center' | 'flex-start'
  horizontalAlign?: 'center' | 'stretch'
  enforceMinHeight?: boolean
  transparentBg?: boolean
  borderless?: boolean
}

type SectionContentAlignment = 'flex-start' | 'center' | 'stretch'

interface SectionProps extends HTMLMotionProps<'div'> {
  apparitionDelay?: number
  style?: MotionStyle
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
  shown: (disabled) => ({ y: 0, opacity: disabled ? 0.5 : 1 }),
  disabled: { y: 0, opacity: 0.5 }
}

export const FloatingPanel: FC<MainPanelProps> = ({ children, ...props }) => (
  <StyledFloatingPanel {...fadeIn} {...props}>
    {children}
  </StyledFloatingPanel>
)

export const Section = ({ children, apparitionDelay, inList, align = 'center', style, className }: SectionProps) => (
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

export const BoxContainer = ({ children, ...props }: HTMLMotionProps<'div'>) => (
  <StyledBoxContainer variants={sectionChildrenVariants} {...props}>
    {children}
  </StyledBoxContainer>
)

const StyledFloatingPanel = styled(motion.div)<MainPanelProps>`
  width: 100%;
  margin: 60px auto;
  max-width: 600px;
  min-height: ${({ enforceMinHeight }) => (enforceMinHeight ? '600px' : 'initial')};
  padding: var(--spacing-5);
  display: flex;
  flex-direction: column;
  justify-content: ${({ verticalAlign }) => verticalAlign || 'flex-start'};
  align-items: ${({ horizontalAlign }) => horizontalAlign || 'stretch'};
  background-color: ${({ theme, transparentBg }) => !transparentBg && theme.bg.background1};
  border: 1px solid ${({ theme, transparentBg }) => (!transparentBg ? theme.border.primary : 'none')};
  border-radius: var(--radius-huge);

  ${({ borderless, theme }) =>
    !borderless &&
    css`
      border: 1px solid ${theme.border.primary};
    `}

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
  min-width: 280px;

  margin-top: ${({ inList }) => (inList ? 'var(--spacing-5)' : '0')};
`

const StyledBoxContainer = styled(Box)`
  display: flex;
  flex-direction: column;
  width: 100%;
`

export const FooterActionsContainer = styled(Section)`
  flex: 0;
  margin-top: var(--spacing-5);
  width: 100%;
`

export const PageTitleRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-3);
`

export const CenteredSection = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex: 1;
  height: 100%;
  background-color: ${({ theme }) => theme.bg.background2};
`
