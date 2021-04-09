import React, { Dispatch, SetStateAction } from 'react'
import { Content, ContentContainer, SectionContainer, SectionTitle } from '../components/SectionComponents'
import { Wallet } from 'alf-client/lib/wallet'
import { Input } from '../components/Inputs'
import { Button } from '../components/Buttons'
import { InfoBox } from '../components/InfoBox'
import { FiAlertTriangle } from 'react-icons/fi'

interface CreateWalletProps {
  setWallet: Dispatch<SetStateAction<Wallet | undefined>>
}

const CreateWallet = ({ setWallet }: CreateWalletProps) => {
  return (
    <SectionContainer>
      <ContentContainer>
        <SectionTitle color="primary">New Account</SectionTitle>
        <Content>
          <Input placeholder="Username" />
          <Input placeholder="Password" />
          <InfoBox Icon={FiAlertTriangle} text={'This is a test!'} />
        </Content>
        <Content apparitionDelay={0.5}>
          <Button secondary>Cancel</Button>
          <Button>Continue</Button>
        </Content>
      </ContentContainer>
    </SectionContainer>
  )
}

export default CreateWallet
