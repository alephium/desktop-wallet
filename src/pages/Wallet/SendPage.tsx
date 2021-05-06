import { Send } from 'lucide-react'
import React, { useContext, useState } from 'react'
import { useHistory } from 'react-router'
import styled, { useTheme } from 'styled-components'
import { GlobalContext } from '../../App'
import { Button } from '../../components/Buttons'
import { InfoBox } from '../../components/InfoBox'
import { Input } from '../../components/Inputs'
import { PageContainer, PageTitle, SectionContent } from '../../components/PageComponents'

const SendPage = () => {
  const history = useHistory()
  const theme = useTheme()
  const { wallet } = useContext(GlobalContext)

  //console.log(wallet)

  const [address, setAddress] = useState('')
  const [amount, setAmount] = useState<string>('')
  const [addressError, setAddressError] = useState<string>('')
  const [isChecking, setIsChecking] = useState(false)

  const onBackButtonpress = () => {
    history.push('/wallet')
  }

  const handleAddressChange = (value: string) => {
    // Check if format is correct
    const match = value.match(/^[MTD][1-9A-Za-z][^OIl]{44}/)

    setAddress(value)

    if (match && match[0]) {
      setAddress(match[0])
      setAddressError('')
    } else {
      setAddressError('Address format is incorrect')
    }
  }

  const handleAmountChange = (value: string) => {
    const valueToReturn = Number(value) // Remove 0 in front if needed
    setAmount(valueToReturn.toString())
  }

  const isSendButtonActive = () => address.length > 0 && addressError.length === 0 && amount.length > 0

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
      {!isChecking ? (
        <SectionContent>
          <Input
            placeholder="Recipient's address"
            value={address}
            onChange={(e) => handleAddressChange(e.target.value)}
            error={addressError}
            isValid={address.length > 0 && !addressError}
          />
          <Input
            placeholder="Amount"
            value={amount}
            onChange={(e) => handleAmountChange(e.target.value)}
            type="number"
          />
        </SectionContent>
      ) : (
        <CheckTransactionContent address={address} amount={amount} />
      )}
      <SectionContent>
        <Button onClick={handleSend} disabled={!isSendButtonActive()}>
          Check
        </Button>
      </SectionContent>
    </PageContainer>
  )
}

const CheckTransactionContent = ({ address, amount }: { address: string; amount: string }) => {
  return (
    <SectionContent>
      <InfoBox text={address} />
    </SectionContent>
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
