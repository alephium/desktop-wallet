import { FC, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import styled from 'styled-components'
import { motion } from 'framer-motion'

const ExpandableSection: FC<{ sectionTitle: string }> = ({ sectionTitle, children }) => {
  const [expanded, setExpanded] = useState(false)

  const handleTitleClick = () => {
    setExpanded(!expanded)
  }

  return (
    <Container>
      <Title onClick={handleTitleClick}>
        <TitleText>{sectionTitle}</TitleText>
        <Chevron animate={{ rotate: expanded ? 180 : 0 }} />
      </Title>
      <ContentWrapper animate={{ height: expanded ? 'auto' : 0 }}>
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
  align-content: center;
`

const Chevron = styled(motion(ChevronDown))`
  width: 16px;
  height: 100%;
`

const TitleText = styled.span`
  margin-right: 10px;
`

const ContentWrapper = styled(motion.div)`
  overflow: hidden;
  height: 0;
`

const Content = styled.div`
  margin-top: 10px;
  padding: 10px;
  border: 1px solid ${({ theme }) => theme.border.secondary};
  border-radius: 7px;
`

export default ExpandableSection
