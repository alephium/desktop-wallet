import { useContext } from 'react'
import styled from 'styled-components'
import { CreateWalletContext } from '.'
import { InfoBox } from '../../components/InfoBox'
import { FooterActions, PageContainer, PageTitle, SectionContent } from '../../components/PageComponents'
import { FiEdit3 } from 'react-icons/fi'
import { Button } from '../../components/Buttons'

const WalletWords = () => {
  const { mnemonic, plainWallet, onButtonBack, onButtonNext } = useContext(CreateWalletContext)
  console.log(plainWallet)
  return (
    <PageContainer>
      <PageTitle color="primary" onBackButtonPress={onButtonBack}>
        Your Wallet
      </PageTitle>
      <PublicAddressContent>
        <Label>Public address</Label>
        <AdressBox>{plainWallet?.address}</AdressBox>
      </PublicAddressContent>
      <WordsContent>
        <Label>Secret words</Label>
        <PhraseBox>{mnemonic}</PhraseBox>
        <InfoBox text={'Carefully note the 24 words. They are the keys to your wallet.'} Icon={FiEdit3} />
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

const Box = styled.div`
  width: 100%;
  padding: 20px;
  color: ${({ theme }) => theme.font.primary};
  font-weight: 600;
  background-color: ${({ theme }) => theme.bg.secondary};
  border-radius: 14px;
`

const AdressBox = styled(Box)`
  text-overflow: ellipsis;
  overflow: hidden;
`

const PhraseBox = styled(Box)`
  background-color: ${({ theme }) => theme.global.alert};
  color: ${({ theme }) => theme.font.contrast};
`

export default WalletWords
