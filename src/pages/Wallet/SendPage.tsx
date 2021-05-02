import React from 'react'
import { useHistory } from 'react-router'
import { Input } from '../../components/Inputs'
import { PageContainer, PageTitle, SectionContent } from '../../components/PageComponents'

const SendPage = () => {
  const history = useHistory()

  const onBackButtonpress = () => {
    history.push('/wallet')
  }

  return (
    <PageContainer>
      <PageTitle onBackButtonPress={onBackButtonpress}>Send</PageTitle>
      <SectionContent>
        <Input placeholder="Address" />
        <Input placeholder="Amount" />
      </SectionContent>
    </PageContainer>
  )
}

export default SendPage
