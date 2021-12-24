/*
Copyright 2018 - 2021 The Alephium Authors
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
import { FC, useEffect, useState } from 'react'
import styled from 'styled-components'

import { Section } from './PageComponents/PageContainers'

const ExpandableSection: FC<{ sectionTitle: string; open?: boolean; onOpenChange?: (isOpen: boolean) => void }> = ({
  sectionTitle,
  open,
  onOpenChange,
  children
}) => {
  const [expanded, setExpanded] = useState(open)

  useEffect(() => {
    setExpanded(open)
  }, [open])

  const handleTitleClick = () => {
    const newState = !expanded
    onOpenChange && onOpenChange(newState)
    setExpanded(newState)
  }

  return (
    <Container>
      <Title onClick={handleTitleClick}>
        <Chevron animate={{ rotate: expanded ? 180 : 0 }} />
        <TitleText>{sectionTitle}</TitleText>
        <Divider />
      </Title>
      <ContentWrapper animate={{ height: expanded ? 'auto' : 0 }} transition={{ duration: 0.2 }}>
        <Content>
          <Section align="stretch">{children}</Section>
        </Content>
      </ContentWrapper>
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  margin: var(--spacing-2) 0;
`

const Title = styled.div`
  display: flex;
  cursor: pointer;
  align-items: center;
`

const Chevron = styled(motion(ChevronDown))`
  width: 16px;
  height: 100%;
`

const TitleText = styled.span`
  margin-left: var(--spacing-2);
  margin-right: var(--spacing-3);
`

const Divider = styled.div`
  height: 1px;
  background-color: ${({ theme }) => theme.border.secondary};
  flex: 1;
`

const ContentWrapper = styled(motion.div)`
  overflow: hidden;
  height: 0;
`

const Content = styled.div`
  margin-top: var(--spacing-2);
  padding: var(--spacing-2);
  border-bottom: 1px solid ${({ theme }) => theme.border.secondary};
`

export default ExpandableSection
