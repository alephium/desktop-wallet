import React, { useCallback, useContext, useEffect, useState } from 'react'
import { useHistory } from 'react-router'
import styled, { useTheme } from 'styled-components'
import { GlobalContext } from '../../App'
import { Send } from 'lucide-react'
import { Button } from '../../components/Buttons'
import { InfoBox } from '../../components/InfoBox'
import { Input } from '../../components/Inputs'
import { PageContainer, SectionContent } from '../../components/PageComponents'
import { WalletContext } from './WalletRootPage'
import Spinner from '../../components/Spinner'
import { ModalContext } from '../../components/Modal'

const SendPage = () => {
  const history = useHistory()
  const theme = useTheme()
  const { client, wallet, setSnackbarMessage } = useContext(GlobalContext)
  const { addPendingTx } = useContext(WalletContext)

  const { setModalTitle, onClose, overrideOnClose } = useContext(ModalContext)

  const [address, setAddress] = useState('')
  const [amount, setAmount] = useState<string>('')
  const [addressError, setAddressError] = useState<string>('')
  const [isChecking, setIsChecking] = useState(false)
  const [isSending, setIsSending] = useState(false)

  const onBackButtonpress = useCallback(() => {
    if (!isChecking) {
      onClose()
    } else {
      setIsChecking(false)
      setModalTitle('Send')
    }
  }, [isChecking, onClose, setModalTitle])

  useEffect(() => {
    // Change behaviour of closing modal
    overrideOnClose(() => onBackButtonpress)
  }, [onBackButtonpress, overrideOnClose])

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
    // const valueToReturn = Number(value).toString() // Remove 0 in front if needed
    setAmount(value)
  }

  const isSendButtonActive = () => address.length > 0 && addressError.length === 0 && amount.length > 0

  const handleSend = async () => {
    if (!isChecking) {
      setIsChecking(true)
      setModalTitle('Info Check')
    } else if (wallet && client) {
      // Send it!
      setIsSending(true)

      // Transform amount in qALF (1e-18)
      const fullAmount = BigInt(Number(amount) * 1e18)

      console.log(fullAmount.toString())

      try {
        const responseCreate = await client.clique.transactionCreate(
          wallet.address,
          wallet.publicKey,
          address,
          fullAmount.toString(),
          undefined
        )

        const signature = client.clique.transactionSign(responseCreate.txId, wallet.privateKey)

        const TXResponse = await client.clique.transactionSend(wallet.address, responseCreate.unsignedTx, signature)

        addPendingTx({
          txId: TXResponse.txId,
          toAddress: address,
          timestamp: new Date().getTime(),
          amount: fullAmount.toString()
        })

        setSnackbarMessage({ text: 'Transaction sent!', type: 'success' })

        history.push('/wallet')
      } catch (e) {
        setSnackbarMessage({ text: e.error.detail, type: 'alert' })
      }
      setIsSending(false)
    }
  }

  return (
    <PageContainer>
      <LogoContent>
        <SendLogo>
          {isSending ? <Spinner size="30%" /> : <Send color={theme.global.accent} size={'80%'} strokeWidth={0.7} />}
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
          {isChecking ? 'Send' : 'Check'}
        </Button>
      </SectionContent>
    </PageContainer>
  )
}

const CheckTransactionContent = ({ address, amount }: { address: string; amount: string }) => {
  return (
    <SectionContent>
      <InfoBox text={address} label="Recipient's address" />
      <InfoBox text={`${amount} ℵ`} label="Amount" />
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
