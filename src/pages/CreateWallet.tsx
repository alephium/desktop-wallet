import { Dispatch, SetStateAction } from 'react'
import { Content, ContentContainer, SectionContainer, SectionTitle } from '../components/SectionComponents'
import { Wallet } from 'alf-client/lib/wallet'
import { Input } from '../components/Inputs'
import { Button } from '../components/Buttons'
import { InfoBox } from '../components/InfoBox'
import { FiAlertTriangle } from 'react-icons/fi'
import styled, { useTheme } from 'styled-components'
import Paragraph from '../components/Paragraph'

interface CreateWalletProps {
  setWallet: Dispatch<SetStateAction<Wallet | undefined>>
}

const CreateWallet = ({ setWallet }: CreateWalletProps) => {
  const theme = useTheme()

  return (
    <SectionContainer>
      <ContentContainer>
        <SectionTitle color="primary">New Account</SectionTitle>
        <Content>
          <Input placeholder="Username" required />
          <Input placeholder="Password" type="password" required />
          <InfoBox
            Icon={FiAlertTriangle}
            text={'Make sure to keep your password secured as it cannot by restored!'}
            iconColor={theme.global.alert}
          />
          <WarningNote>{'Alephium doesn’t have access to your account.\nYou are the only owner.'}</WarningNote>
        </Content>
        <Content apparitionDelay={0.2} style={{ flex: 1 }}>
          <Button secondary>Cancel</Button>
          <Button>Continue</Button>
        </Content>
      </ContentContainer>
    </SectionContainer>
  )
}

const WarningNote = styled(Paragraph)`
  text-align: center;
  color: ${({ theme }) => theme.font.secondary};
`

export default CreateWallet
