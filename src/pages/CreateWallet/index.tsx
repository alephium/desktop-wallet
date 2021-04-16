import React, { Dispatch, SetStateAction, useContext, useEffect, useState } from 'react'
import { ContentContainer, PageContainer, PageTitle, SectionContent } from '../../components/PageComponents'
import { generate } from 'alf-client'
import { useHistory, useParams } from 'react-router'
import CreateAccount from './CreateAccount'
import { Button } from '../../components/Buttons'
import WalletWords from './WalletWords'
import { AnimatePresence } from 'framer-motion'
import { GlobalContext } from '../../App'

interface Step {
  pageTitle: JSX.Element
  pageContent: JSX.Element
}

interface RouteParams {
  step: string | undefined
}

interface Context {
  mnemonic: string
  username: string
  usernames: string[]
  updateContext: (s: Partial<Context>) => void
  activateNextButton: Dispatch<SetStateAction<boolean>>
}

const initialContext: Context = {
  mnemonic: '',
  username: '',
  usernames: [],
  updateContext: () => null,
  activateNextButton: () => null
}

export const CreateWalletContext = React.createContext<Context>(initialContext)

// ============== //
/* MAIN COMPONENT */
// ============== //

const CreateWallet = () => {
  const { networkType, setWallet } = useContext(GlobalContext)
  const history = useHistory()
  const { step } = useParams<RouteParams>()
  const [nextButtonActivated, setNextButtonActivated] = useState(false)

  initialContext.activateNextButton = setNextButtonActivated
  initialContext.updateContext = (c: Partial<Context>) => {
    setContext({
      ...context,
      ...c
    })
  }

  const [context, setContext] = useState<Context>(initialContext)

  // Init wallet
  useEffect(() => {
    const result = generate(networkType)
    setWallet(result.wallet)
    initialContext.updateContext({
      mnemonic: result.mnemonic
    })
  }, [networkType, setWallet])

  // Steps management
  const stepNumber = step ? parseInt(step) : 0

  const createWalletSteps: Step[] = [
    {
      pageTitle: <PageTitle color="primary">New Account</PageTitle>,
      pageContent: <CreateAccount />
    },
    {
      pageTitle: <PageTitle color="primary">Your Wallet</PageTitle>,
      pageContent: <WalletWords />
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
    <CreateWalletContext.Provider value={context}>
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
    </CreateWalletContext.Provider>
  )
}

export default CreateWallet
