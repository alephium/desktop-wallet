import { Send } from 'lucide-react'
import React, { useContext, useState } from 'react'
import { useHistory } from 'react-router'
import styled, { useTheme } from 'styled-components'
import { GlobalContext } from '../../App'
import { Button } from '../../components/Buttons'
import { Input } from '../../components/Inputs'
import { PageContainer, PageTitle, SectionContent } from '../../components/PageComponents'

const SendPage = () => {
  const history = useHistory()
  const theme = useTheme()
  const { wallet } = useContext(GlobalContext)

  //console.log(wallet)

  const [address, setAddress] = useState('')
  const [amount, setAmount] = useState<number>()

  const onBackButtonpress = () => {
    history.push('/wallet')
  }

  const handleSend = () => {
    //console.log('send')
  }

  return (
    <PageContainer>
      <PageTitle onBackButtonPress={onBackButtonpress}>Send</PageTitle>
      <LogoContent>
        <SendLogo>
          <Send color={theme.global.accent} size={'80%'} strokeWidth={0.7} />
        </SendLogo>
      </LogoContent>
      <SectionContent>
        <Input placeholder="Recipient's address" value={address} onChange={(e) => setAddress(e.target.value)} />
        <Input
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
          type="number"
        />
      </SectionContent>
      <SectionContent>
        <Button onClick={handleSend}>Send</Button>
      </SectionContent>
    </PageContainer>
  )
}

const LogoContent = styled(SectionContent)`
  flex: 0;
  margin: 20px;
`

const SendLogo = styled.div`
  height: 15vh;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
`

export default SendPage
