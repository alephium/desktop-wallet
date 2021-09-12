import React, { useContext } from 'react'
import { Button } from '../../components/Buttons'
import { FooterActions, PageContainer, PageTitle, SectionContent } from '../../components/PageComponents'
import { ReactComponent as LockHandleSVG } from '../../images/lock_handle.svg'
import { ReactComponent as LockBodySVG } from '../../images/lock_body.svg'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import { CenteredMainParagraph, CenteredSecondaryParagraph } from '../../components/Paragraph'
import { StepsContext } from '../MultiStepsController'

const CheckWordsIntroPage = () => {
  const { onButtonBack, onButtonNext } = useContext(StepsContext)

  return (
    <PageContainer>
      <PageTitle color="primary" onBackButtonPress={onButtonBack}>
        Security Check
      </PageTitle>
      <SectionContent>
        <LockContainer>
          <Lock
            initial={{ rotate: 0 }}
            animate={{ rotate: [0, 10, -5, 0], y: [0, 10, -5, 0] }}
            transition={{ delay: 1.1, duration: 0.3 }}
          >
            <LockHandleContainer
              initial={{ y: 10 }}
              animate={{ y: 50 }}
              transition={{ delay: 1 }}
              style={{ zIndex: -1 }}
            >
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
      <FooterActions apparitionDelay={0.3}>
        <Button onClick={onButtonNext}>Ready!</Button>
      </FooterActions>
    </PageContainer>
  )
}

const LockContainer = styled.div`
  width: 100%;
  margin-bottom: 25px;
  background-color: ${({ theme }) => theme.bg.secondary};
  border-radius: 7px;
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
`

const LockHandle = styled(LockHandleSVG)`
  width: 100%;
`

const LockBody = styled(LockBodySVG)`
  width: 100%;
`

export default CheckWordsIntroPage
