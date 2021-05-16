import React from 'react'
import { MainContainer } from '../components/PageComponents'
import { useHistory, useParams } from 'react-router'

interface RouteParams {
  step: string | undefined
}

interface StepsContext {
  onButtonNext: () => void
  onButtonBack: () => void
}
const initialContext: StepsContext = {
  onButtonNext: () => null,
  onButtonBack: () => null
}

export const StepsContext = React.createContext<StepsContext>(initialContext)

// ============== //
/* MAIN COMPONENT */
// ============== //

const MultiStepsController = ({ stepElements, baseUrl }: { stepElements: JSX.Element[]; baseUrl: string }) => {
  const history = useHistory()
  const { step } = useParams<RouteParams>()

  const onButtonNext = () => {
    window.scrollTo(0, 0)
    history.push(`/${baseUrl}/${stepNumber + 1}`)
  }
  const onButtonBack = () => {
    window.scrollTo(0, 0)
    if (stepNumber === 0) {
      history.push('/')
    } else {
      history.push(`${stepNumber - 1}`)
    }
  }

  // Steps management
  const stepNumber = step ? parseInt(step) : 0

  // Redirect if step not set properly
  if (stepNumber > stepElements.length) {
    history.replace(`/${baseUrl}/${stepElements.length - 1}`)
  }

  const isStepNumberCorrect = () => {
    return stepNumber >= 0 && stepNumber < stepElements.length
  }

  return (
    <StepsContext.Provider value={{ onButtonNext, onButtonBack }}>
      <MainContainer>{isStepNumberCorrect() && stepElements[stepNumber]}</MainContainer>
    </StepsContext.Provider>
  )
}

export default MultiStepsController
