import { useEffect } from 'react'
import { StepProps } from '.'
import { SectionContent } from '../../components/PageComponents'

type WalletWordsProps = StepProps

const WalletWords = ({ activateNextButton }: WalletWordsProps) => {
  useEffect(() => {
    activateNextButton(true)
  }, [activateNextButton])

  return <SectionContent>Test</SectionContent>
}

export default WalletWords
