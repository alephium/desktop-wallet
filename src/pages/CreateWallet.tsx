import React, { Dispatch, SetStateAction } from 'react'
import { ContentContainer, SectionContainer } from '../components/Containers'
import { Wallet } from 'alf-client/lib/wallet'

interface CreateWalletProps {
  setWallet: Dispatch<SetStateAction<Wallet | undefined>>
}

const CreateWallet = ({ setWallet }: CreateWalletProps) => {
  return (
    <SectionContainer>
      <ContentContainer>
        <h1>New Account</h1>
      </ContentContainer>
    </SectionContainer>
  )
}

export default CreateWallet
