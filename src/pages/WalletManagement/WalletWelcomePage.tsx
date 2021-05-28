import styled from 'styled-components'
import Confetti from 'react-confetti'
import { FooterActions, PageContainer, SectionContent } from '../../components/PageComponents'
import { useTimeout, useWindowSize } from '../../utils/hooks'
import React, { useState } from 'react'
import { Button } from '../../components/Buttons'
import { useHistory } from 'react-router'
import Paragraph from '../../components/Paragraph'

// This is shown when a user create or import a wallet

const WalletWelcomePage = () => {
  const { width, height } = useWindowSize()
  const [confettiRunning, setConfettiRunning] = useState(true)
  const history = useHistory()

  useTimeout(() => {
    setConfettiRunning(false)
  }, 3000)

  return (
    <PageContainer>
      <ConfettiWrapper>
        <Confetti width={width} height={height} numberOfPieces={confettiRunning ? 200 : 0} />
      </ConfettiWrapper>
      <SectionContent>
        <ReadyParagraph>Everything is ready!</ReadyParagraph>
        <SubParagraph>Welcome to Alephium.</SubParagraph>
      </SectionContent>
      <FooterActions apparitionDelay={0.3}>
        <Button onClick={() => history.push('/wallet')}>{"Let's go!"}</Button>
      </FooterActions>
    </PageContainer>
  )
}

const ConfettiWrapper = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  pointer-events: none;
`

const ReadyParagraph = styled(Paragraph)`
  text-align: center;
  font-size: 3rem;
  font-weight: 800;
`

const SubParagraph = styled(Paragraph)`
  text-align: center;
  font-size: 1.5rem;
  color: ${({ theme }) => theme.font.secondary};
`

export default WalletWelcomePage
