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

import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import Button from '@/components/Button'
import {
  FloatingPanel,
  FooterActionsContainer,
  PanelContentContainer,
  Section
} from '@/components/PageComponents/PageContainers'
import PanelTitle from '@/components/PageComponents/PanelTitle'
import Paragraph from '@/components/Paragraph'
import { useStepsContext } from '@/contexts/steps'
import { ReactComponent as LockBodySVG } from '@/images/lock_body.svg'
import { ReactComponent as LockHandleSVG } from '@/images/lock_handle.svg'

const CheckWordsIntroPage = () => {
  const { t } = useTranslation()
  const { onButtonBack, onButtonNext } = useStepsContext()

  return (
    <FloatingPanel enforceMinHeight>
      <PanelTitle color="primary" onBackButtonClick={onButtonBack}>
        {t`Security Check`}
      </PanelTitle>
      <PanelContentContainer>
        <Section>
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
          <Paragraph centered>{t`Alright! Time to check if you got your words right!`}</Paragraph>
          <Paragraph secondary centered>
            {t`Select the words in the right order. Ready?`}
          </Paragraph>
        </Section>
      </PanelContentContainer>
      <FooterActionsContainer>
        <Button onClick={onButtonNext}>{t`Ready!`}</Button>
      </FooterActionsContainer>
    </FloatingPanel>
  )
}

export default CheckWordsIntroPage

const LockContainer = styled.div`
  width: 100%;
  margin-bottom: var(--spacing-5);
  border-radius: var(--radius-small);
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
`

const LockBodyContainer = styled(motion.div)`
  width: 100%;
  flex: 1;
  isolation: isolate;
`

const LockHandle = styled(LockHandleSVG)`
  width: 100%;
`

const LockBody = styled(LockBodySVG)`
  width: 100%;
`
