import React, { Dispatch, SetStateAction, useState } from 'react'
import { ContentContainer, PageContainer, PageTitle, SectionContent } from '../../components/PageComponents'
import { Wallet } from 'alf-client'
import { useHistory, useParams } from 'react-router'
import CreateAccount from './CreateAccount'
import { Button } from '../../components/Buttons'
import WalletWords from './WalletWords'
import { BrowserRouter as Router, Route } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'

interface CreateWalletProps {
  setWallet: Dispatch<SetStateAction<Wallet | undefined>>
}

export interface StepProps {
  activateNextButton: (activate: boolean) => void
}

interface Step {
  pageTitle: JSX.Element
  pageContent: JSX.Element
}

interface RouteParams {
  step: string | undefined
}

const CreateWallet = ({ setWallet }: CreateWalletProps) => {
  const history = useHistory()
  const { step } = useParams<RouteParams>()
  const [nextButtonActivated, setNextButtonActivated] = useState(false)

  const stepNumber = step ? parseInt(step) : 0

  const createWalletSteps: Step[] = [
    {
      pageTitle: <PageTitle color="primary">New Account</PageTitle>,
      pageContent: <CreateAccount setWallet={setWallet} activateNextButton={setNextButtonActivated} />
    },
    {
      pageTitle: <PageTitle color="primary">Your Wallet</PageTitle>,
      pageContent: <WalletWords activateNextButton={setNextButtonActivated} />
    }
  ]

  // Redirect if step not set properly
  if (stepNumber > createWalletSteps.length) {
    history.replace(`/create/${createWalletSteps.length - 1}`)
  }

  const handleButtonNext = () => {
    history.push(`/create/${stepNumber + 1}`)
  }

  const handleButtonPrevious = () => {
    if (stepNumber === 0) {
      history.push('/')
    } else {
      history.push(`/create/${stepNumber - 1}`)
    }
  }

  const isStepNumberCorrect = () => {
    return stepNumber >= 0 && stepNumber < createWalletSteps.length
  }

  return (
    <PageContainer>
      <ContentContainer>
        {isStepNumberCorrect() && createWalletSteps[stepNumber].pageTitle}
        <AnimatePresence>{isStepNumberCorrect() && createWalletSteps[stepNumber].pageContent}</AnimatePresence>
        <SectionContent apparitionDelay={0.2} style={{ flex: 1 }}>
          <Button secondary onClick={handleButtonPrevious}>
            Cancel
          </Button>
          <Button disabled={!nextButtonActivated} onClick={handleButtonNext}>
            Continue
          </Button>
        </SectionContent>
      </ContentContainer>
    </PageContainer>
  )
}

export default CreateWallet
