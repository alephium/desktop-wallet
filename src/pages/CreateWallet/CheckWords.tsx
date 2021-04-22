import React, { useContext } from 'react'
import { CreateWalletContext } from '.'
import { Button } from '../../components/Buttons'
import { FooterActions, PageContainer, PageTitle } from '../../components/PageComponents'

const CheckWords = () => {
  const { mnemonic, onButtonBack, onButtonNext } = useContext(CreateWalletContext)

  return (
    <PageContainer>
      <PageTitle color="primary">Security Check (1)</PageTitle>
      <FooterActions apparitionDelay={0.3}>
        <Button secondary onClick={onButtonBack}>
          Cancel
        </Button>
        <Button onClick={onButtonNext}>Continue</Button>
      </FooterActions>
    </PageContainer>
  )
}

export default CheckWords
