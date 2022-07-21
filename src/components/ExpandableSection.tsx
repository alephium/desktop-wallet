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

import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { FC, useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'

import ClickableArea from './Buttons/ClickableArea'
import { Section } from './PageComponents/PageContainers'

interface ExpandableSectionProps {
  sectionTitleClosed: string
  sectionTitleOpen?: string
  open?: boolean
  onOpenChange?: (isOpen: boolean) => void
  centered?: boolean
  className?: string
}

const ExpandableSection: FC<ExpandableSectionProps> = ({
  sectionTitleClosed,
  sectionTitleOpen,
  open,
  onOpenChange,
  children,
  centered,
  className
}) => {
  const [isExpanded, setIsExpanded] = useState(open)
  const [isVisible, setIsVisible] = useState(open)

  useEffect(() => {
    if (open) {
      setIsVisible(open)
      setIsExpanded(open)
    } else {
      setIsExpanded(open)
    }
  }, [open])

  const onAnimationComplete = useCallback(() => {
    setIsVisible(isExpanded)
  }, [isExpanded])

  const handleTitleExpansion = () => {
    const newState = !isExpanded
    onOpenChange && onOpenChange(newState)
    if (newState) {
      setIsVisible(newState)
    }
    setIsExpanded(newState)
  }

  const titleText = isExpanded && sectionTitleOpen ? sectionTitleOpen : sectionTitleClosed

  return (
    <div className={className}>
      <Title onClick={handleTitleExpansion} aria-expanded={isExpanded} aria-pressed={isExpanded} aria-label={titleText}>
        {centered && <LeftDivider />}
        <Chevron animate={{ rotate: isExpanded ? 180 : 0 }} />
        <TitleText>{titleText}</TitleText>
        <Divider />
      </Title>
      {isVisible && (
        <ContentWrapper
          onAnimationComplete={onAnimationComplete}
          animate={{ height: isExpanded ? 'auto' : 0 }}
          transition={{ duration: 0.2 }}
        >
          <Content>
            <Section align="stretch">{children}</Section>
          </Content>
        </ContentWrapper>
      )}
    </div>
  )
}

export default styled(ExpandableSection)`
  display: flex;
  flex-direction: column;
  margin: var(--spacing-5) 0;
`

const Title = styled(ClickableArea)`
  display: flex;
  align-items: center;
  color: ${({ theme }) => theme.global.accent};
`

const Chevron = styled(motion(ChevronDown))`
  width: 16px;
  height: 100%;
`

const TitleText = styled.span`
  margin-left: 6px;
  margin-right: 6px;
`

const Divider = styled.div`
  height: 1px;
  background-color: ${({ theme }) => theme.border.secondary};
  flex: 1;
`

const LeftDivider = styled(Divider)`
  margin-right: 6px;
`

const ContentWrapper = styled(motion.div)`
  overflow: hidden;
  height: 0;
`

const Content = styled.div`
  margin-top: var(--spacing-2);
  padding: var(--spacing-2);
`
