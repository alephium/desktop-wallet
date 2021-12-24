/*
Copyright 2018 - 2021 The Alephium Authors
This file is part of the alephium project.

The library is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with the library. If not, see <http://www.gnu.org/licenses/>.
*/

import { Send } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useHistory } from 'react-router'
import styled, { useTheme } from 'styled-components'

import { Button } from '../../components/Buttons'
import ExpandableSection from '../../components/ExpandableSection'
import InfoBox from '../../components/InfoBox'
import Input from '../../components/Inputs/Input'
import { Section } from '../../components/PageComponents/PageContainers'
import PasswordConfirmation from '../../components/PasswordConfirmation'
import Spinner from '../../components/Spinner'
import { useGlobalContext } from '../../contexts/global'
import { useModalContext } from '../../contexts/modal'
import { useTransactionsContext } from '../../contexts/transactions'
import { checkAddressValidity } from '../../utils/addresses'
import { getHumanReadableError } from '../../utils/api'
import { minimalGasAmount, minimalGasPrice } from '../../utils/constants'
import { abbreviateAmount, convertToQALPH } from '../../utils/numbers'

const onAmountInputValueChange = ({
  amount,
  minAmount,
  stateSetter,
  errorMessage,
  currentErrorState,
  errorStateSetter,
  shouldConvertToQALPH
}: {
  amount: string
  minAmount: bigint
  errorMessage: string
  stateSetter: (v: string) => void
  currentErrorState: string
  errorStateSetter: (v: string) => void
  shouldConvertToQALPH?: boolean
}) => {
  let amountNumber

  try {
    amountNumber = BigInt(shouldConvertToQALPH ? convertToQALPH(amount) : amount)
  } catch (e) {
    console.log(e)
    return
  }

  if (amountNumber < minAmount) {
    errorStateSetter(errorMessage)
  } else {
    if (currentErrorState) errorStateSetter('')
  }

  stateSetter(amount)
}

type StepIndex = 1 | 2 | 3

const SendPage = () => {
  const history = useHistory()
  const theme = useTheme()
  const { client, wallet, setSnackbarMessage } = useGlobalContext()
  const { addPendingTx } = useTransactionsContext()
  const { setModalTitle, onModalClose, setOnModalClose } = useModalContext()

  const initialOnModalClose = useRef(onModalClose)
  const minimalGasPriceInALPH = abbreviateAmount(minimalGasPrice)

  const [address, setAddress] = useState('')
  const [amount, setAmount] = useState('')
  const [gasAmount, setGasAmount] = useState<string>(minimalGasAmount.toString())
  const [gasPrice, setGasPrice] = useState<string>(minimalGasPriceInALPH)

  const [isSending, setIsSending] = useState(false)
  const [step, setStep] = useState<StepIndex>(1)

  useEffect(() => {
    if (step === 1) {
      setModalTitle('Send')
      setOnModalClose(() => initialOnModalClose.current)
    } else if (step === 2) {
      setModalTitle('Info Check')
      setOnModalClose(() => () => setStep(1))
    } else if (step === 3) {
      setModalTitle('Password Check')
      setOnModalClose(() => () => setStep(2))
    }
  }, [setStep, setModalTitle, setOnModalClose, step])

  const verifyTransactionContent = (address: string, amount: string, gasAmount: string, gasPrice: string) => {
    setAddress(address)
    setAmount(amount)
    setGasAmount(gasAmount)
    setGasPrice(gasPrice)
    setStep(2)
  }

  const confirmPassword = () => {
    setStep(3)
  }

  const handleSend = async () => {
    if (wallet && client) {
      setIsSending(true)

      const fullAmount = convertToQALPH(amount).toString()

      try {
        const txCreateResp = await client.clique.transactionCreate(
          wallet.address,
          wallet.publicKey,
          address,
          fullAmount
        )

        const { txId, unsignedTx } = txCreateResp.data

        const signature = client.clique.transactionSign(txId, wallet.privateKey)

        const txSendResp = await client.clique.transactionSend(wallet.address, unsignedTx, signature)

        addPendingTx({
          txId: txSendResp.data.txId,
          toAddress: address,
          timestamp: new Date().getTime(),
          amount: fullAmount
        })

        setSnackbarMessage({ text: 'Transaction sent!', type: 'success' })
        history.push('/wallet')
      } catch (e) {
        setSnackbarMessage({
          text: getHumanReadableError(e, 'Error while sending the transaction'),
          type: 'alert',
          duration: 5000
        })
      }

      setIsSending(false)
    }
  }

  return (
    <>
      <LogoContent>
        <SendLogo>
          {isSending ? <Spinner size="30%" /> : <Send color={theme.global.accent} size={'70%'} strokeWidth={0.7} />}
        </SendLogo>
      </LogoContent>
      {step === 1 && (
        <TransactionForm
          address={address}
          amount={amount}
          gasAmount={gasAmount}
          gasPrice={gasPrice}
          onSubmit={verifyTransactionContent}
        />
      )}
      {step === 2 && (
        <CheckTransactionContent
          address={address}
          amount={amount}
          gasAmount={gasAmount}
          gasPrice={gasPrice}
          onSend={confirmPassword}
        />
      )}
      {step === 3 && (
        <PasswordConfirmation
          text="Enter your password to send the transaction."
          buttonText="Send"
          onCorrectPasswordEntered={handleSend}
        />
      )}
    </>
  )
}

interface TransactionData {
  address: string
  amount: string
  gasAmount: string
  gasPrice: string
}

interface TransactionFormProps extends TransactionData {
  onSubmit: (address: string, amount: string, gasAmount: string, gasPrice: string) => void
}

const TransactionForm = ({ address, amount, gasAmount, gasPrice, onSubmit }: TransactionFormProps) => {
  const [addressState, setAddress] = useState(address)
  const [amountState, setAmount] = useState(amount)
  const [gasAmountState, setGasAmount] = useState(gasAmount)
  const [gasPriceState, setGasPrice] = useState(gasPrice)
  const [addressError, setAddressError] = useState('')
  const [gasAmountError, setGasAmountError] = useState('')
  const [gasPriceError, setGasPriceError] = useState('')
  const minimalGasPriceInALPH = abbreviateAmount(minimalGasPrice)

  const handleAddressChange = (value: string) => {
    setAddress(value)
    const validValue = checkAddressValidity(value)

    if (validValue) {
      setAddress(validValue)
      setAddressError('')
    } else {
      setAddressError('Address format is incorrect')
    }
  }

  const handleGasAmountChange = (newAmount: string) => {
    onAmountInputValueChange({
      amount: newAmount,
      minAmount: BigInt(minimalGasAmount),
      stateSetter: setGasAmount,
      errorMessage: `Gas amount must be greater than ${minimalGasAmount}.`,
      currentErrorState: gasAmountError,
      errorStateSetter: setGasAmountError
    })
  }

  const handleGasPriceChange = (newPrice: string) => {
    onAmountInputValueChange({
      amount: newPrice,
      minAmount: minimalGasPrice,
      stateSetter: setGasPrice,
      errorMessage: `Gas price must be greater than ${abbreviateAmount(minimalGasPrice)}ℵ.`,
      currentErrorState: gasPriceError,
      errorStateSetter: setGasPriceError,
      shouldConvertToQALPH: true
    })
  }

  const isSubmitButtonActive = addressState.length > 0 && addressError.length === 0 && amountState.length > 0

  return (
    <>
      <Section>
        <Input
          placeholder="Recipient's address"
          value={addressState}
          onChange={(e) => handleAddressChange(e.target.value)}
          error={addressError}
          isValid={addressState.length > 0 && !addressError}
        />
        <Input
          placeholder="Amount (ℵ)"
          value={amountState}
          onChange={(e) => setAmount(e.target.value)}
          type="number"
          min="0"
        />
      </Section>
      <ExpandableSection sectionTitle="Advanced settings">
        <Input
          id="gas-amount"
          placeholder="Gas amount"
          value={gasAmountState}
          onChange={(e) => handleGasAmountChange(e.target.value)}
          type="number"
          error={gasAmountError}
        />
        <Input
          id="gas-price"
          placeholder="Gas price (ℵ)"
          value={gasPriceState}
          type="number"
          min={minimalGasPriceInALPH}
          onChange={(e) => handleGasPriceChange(e.target.value)}
          step={minimalGasPriceInALPH}
          error={gasPriceError}
        />
      </ExpandableSection>
      <Section inList>
        <Button
          onClick={() => onSubmit(addressState, amountState, gasAmountState, gasPriceState)}
          disabled={!isSubmitButtonActive}
        >
          Check
        </Button>
      </Section>
    </>
  )
}

interface CheckTransactionContentProps extends TransactionData {
  onSend: () => void
}

const CheckTransactionContent = ({ address, amount, onSend }: CheckTransactionContentProps) => {
  const isSendButtonActive = address.length > 0 && amount.length > 0

  return (
    <>
      <Section>
        <InfoBox text={address} label="Recipient's address" wordBreak />
        <InfoBox text={`${amount} ℵ`} label="Amount" />
      </Section>
      <Section inList>
        <Button onClick={onSend} disabled={!isSendButtonActive}>
          Send
        </Button>
      </Section>
    </>
  )
}

const LogoContent = styled(Section)`
  flex: 0;
  margin: var(--spacing-4);
`

const SendLogo = styled.div`
  height: 10vh;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
`

export default SendPage
