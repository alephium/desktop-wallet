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

import { useState } from 'react'
import Confetti from 'react-confetti'
import { useHistory } from 'react-router'
import styled from 'styled-components'

import Button from '../../components/Button'
import { FooterActionsContainer, Section } from '../../components/PageComponents/PageContainers'
import Paragraph from '../../components/Paragraph'
import { useTimeout, useWindowSize } from '../../utils/hooks'

// This is shown when a user creates or imports a wallet

const WalletWelcomePage = () => {
  const { width, height } = useWindowSize()
  const [confettiRunning, setConfettiRunning] = useState(true)
  const history = useHistory()

  useTimeout(() => {
    setConfettiRunning(false)
  }, 3000)

  return (
    <Container>
      <ConfettiWrapper>
        <Confetti width={width} height={height} numberOfPieces={confettiRunning ? 200 : 0} />
      </ConfettiWrapper>
      <Section>
        <ReadyParagraph>Everything is ready!</ReadyParagraph>
        <SubParagraph>Welcome to Alephium.</SubParagraph>
      </Section>
      <FooterActionsContainer apparitionDelay={0.3}>
        <Button onClick={() => history.push('/wallet')} submit>
          {"Let's go!"}
        </Button>
      </FooterActionsContainer>
    </Container>
  )
}

const Container = styled.main`
  flex: 1;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.bg.primary};
`

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
  font-weight: var(--fontWeight-bold);
`

const SubParagraph = styled(Paragraph)`
  text-align: center;
  font-size: 1.5rem;
  color: ${({ theme }) => theme.font.secondary};
`

export default WalletWelcomePage
