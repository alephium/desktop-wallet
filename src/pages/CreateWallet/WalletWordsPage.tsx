import { useContext } from 'react'
import styled from 'styled-components'
import { CreateWalletContext } from './CreateWalletRootPage'
import { InfoBox } from '../../components/InfoBox'
import { FooterActions, PageContainer, PageTitle, SectionContent } from '../../components/PageComponents'
import { Edit3 } from 'lucide-react'
import { Button } from '../../components/Buttons'
import { GlobalContext } from '../../App'
import { StepsContext } from '../MultiStepsController'

const WalletWordsPage = () => {
  const { mnemonic, plainWallet } = useContext(CreateWalletContext)
  const { onButtonBack, onButtonNext } = useContext(StepsContext)
  const { setSnackbarMessage } = useContext(GlobalContext)

  const handleAddressClick = () => {
    const address = plainWallet?.address
    if (address) {
      navigator.clipboard
        .writeText(address)
        .catch((e) => {
          throw e
        })
        .then(() => {
          setSnackbarMessage({ text: 'Address copied to clipboard!', type: 'info' })
        })
    }
  }

  return (
    <PageContainer>
      <PageTitle color="primary" onBackButtonPress={onButtonBack}>
        Your Wallet
      </PageTitle>
      <PublicAddressContent>
        <InfoBox text={plainWallet?.address || ''} label={'Your address'} onClick={handleAddressClick} />
      </PublicAddressContent>
      <WordsContent>
        <Label>Secret words</Label>
        <PhraseBox>{mnemonic}</PhraseBox>
        <InfoBox text={'Carefully note the 24 words. They are the keys to your wallet.'} Icon={Edit3} />
      </WordsContent>
      <FooterActions apparitionDelay={0.3}>
        <Button onClick={onButtonNext}>Continue</Button>
      </FooterActions>
    </PageContainer>
  )
}

const Label = styled.label`
  width: 100%;
  padding-left: 15px;
  padding-bottom: 5px;
  color: ${({ theme }) => theme.font.secondary};
  font-weight: 600;
`

const PublicAddressContent = styled(SectionContent)`
  flex: 0;
  justify-content: flex-start;
  margin-bottom: 5vh;
`

const WordsContent = styled(SectionContent)`
  justify-content: flex-start;
`

const PhraseBox = styled.div`
  width: 100%;
  padding: 20px;
  color: ${({ theme }) => theme.font.contrast};
  font-weight: 600;
  background-color: ${({ theme }) => theme.global.alert};
  border-radius: 14px;
  margin-bottom: 20px;
`

export default WalletWordsPage
