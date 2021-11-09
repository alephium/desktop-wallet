import { FC, useEffect, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import styled from 'styled-components'
import { motion } from 'framer-motion'

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
        <Content>{children}</Content>
      </ContentWrapper>
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
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
  margin-left: 10px;
  margin-right: 15px;
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
  margin-top: 10px;
  padding: 10px;
  border-bottom: 1px solid ${({ theme }) => theme.border.secondary};
`

export default ExpandableSection
