// Copyright 2018 - 2021 The Alephium Authors
// This file is part of the alephium project.
//
// The library is free software: you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// The library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public License
// along with the library. If not, see <http://www.gnu.org/licenses/>.

import { useContext } from 'react'
import styled from 'styled-components'
import { motion } from 'framer-motion'

import { Button } from '../../components/Buttons'
import { FooterActions, MainPanel, PanelContainer, PanelContent, SectionContent } from '../../components/PageComponents'
import { CenteredMainParagraph, CenteredSecondaryParagraph } from '../../components/Paragraph'
import { StepsContext } from '../MultiStepsController'

import { ReactComponent as LockHandleSVG } from '../../images/lock_handle.svg'
import { ReactComponent as LockBodySVG } from '../../images/lock_body.svg'
import PanelTitle from '../../components/PageComponents/PanelTitle'

const CheckWordsIntroPage = () => {
  const { onButtonBack, onButtonNext } = useContext(StepsContext)

  return (
    <MainPanel enforceMinHeight>
      <PanelContainer>
        <PanelTitle color="primary" onBackButtonPress={onButtonBack}>
          Security Check
        </PanelTitle>
        <PanelContent>
          <SectionContent>
            <LockContainer>
              <Lock
                initial={{ rotate: 0 }}
                animate={{ rotate: [0, 10, -5, 0], y: [0, 10, -5, 0] }}
                transition={{ delay: 1.1, duration: 0.3 }}
              >
                <LockHandleContainer initial={{ y: 10 }} animate={{ y: 50 }} transition={{ delay: 1 }}>
                  <LockHandle />
                </LockHandleContainer>
                <LockBodyContainer>
                  <LockBody />
                </LockBodyContainer>
              </Lock>
            </LockContainer>
            <CenteredMainParagraph>Alright! Time to check if you got your words right!</CenteredMainParagraph>
            <CenteredSecondaryParagraph>Select the words in the right order. Ready?</CenteredSecondaryParagraph>
          </SectionContent>
        </PanelContent>
        <FooterActions apparitionDelay={0.3}>
          <Button onClick={onButtonNext} submit>
            Ready!
          </Button>
        </FooterActions>
      </PanelContainer>
    </MainPanel>
  )
}

const LockContainer = styled.div`
  width: 100%;
  margin-bottom: var(--spacing-5);
  background-color: ${({ theme }) => theme.bg.secondary};
  border-radius: var(--radius);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding-bottom: 60px;
`

const Lock = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 35vw;
`

const LockHandleContainer = styled(motion.div)`
  width: 70%;
  flex: 1;
  z-index: 0;
`

const LockBodyContainer = styled(motion.div)`
  width: 100%;
  flex: 1;
  z-index: 1;
`

const LockHandle = styled(LockHandleSVG)`
  width: 100%;
`

const LockBody = styled(LockBodySVG)`
  width: 100%;
`

export default CheckWordsIntroPage
