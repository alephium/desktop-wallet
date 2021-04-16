import React, { useContext } from 'react'
import styled from 'styled-components'
import { CreateWalletContext } from '.'
import { InfoBox } from '../../components/InfoBox'
import { FooterActions, PageContainer, PageTitle, SectionContent } from '../../components/PageComponents'
import { FiEdit3 } from 'react-icons/fi'
import { Button } from '../../components/Buttons'

const WalletWords = () => {
  const { mnemonic, onButtonBack, onButtonNext } = useContext(CreateWalletContext)

  return (
    <PageContainer>
      <PageTitle color="primary">Your Wallet</PageTitle>
      <SectionContent>
        <Label>Secret words</Label>
        <PhraseBox>{mnemonic}</PhraseBox>
        <InfoBox text={'Carefully note the 24 words. They are the keys to your wallet.'} Icon={FiEdit3} />
      </SectionContent>
      <FooterActions apparitionDelay={0.3}>
        <Button secondary onClick={onButtonBack}>
          Cancel
        </Button>
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

const PhraseBox = styled.div`
  width: 100%;
  padding: 20px;
  color: ${({ theme }) => theme.font.contrast};
  font-weight: 600;
  background-color: ${({ theme }) => theme.global.alert};
  border-radius: 14px;
`

export default WalletWords
