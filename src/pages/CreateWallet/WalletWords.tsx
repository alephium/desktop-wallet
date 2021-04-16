import { useContext, useEffect } from 'react'
import { CreateWalletContext } from '.'
import { SectionContent } from '../../components/PageComponents'

const WalletWords = () => {
  const { activateNextButton } = useContext(CreateWalletContext)
  useEffect(() => {
    activateNextButton(true)
  }, [activateNextButton])

  return <SectionContent>Test</SectionContent>
}

export default WalletWords
