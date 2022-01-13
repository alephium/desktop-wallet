/*
Copyright 2018 - 2022 The Alephium Authors
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
import { useTheme } from 'styled-components'

import Button from '../../components/Button'
import ConsolidateUTXOsModal from '../../components/ConsolidateUTXOsModal'
import ExpandableSection from '../../components/ExpandableSection'
import InfoBox from '../../components/InfoBox'
import Input from '../../components/Inputs/Input'
import { HeaderContent, HeaderLogo } from '../../components/Modal'
import { Section } from '../../components/PageComponents/PageContainers'
import PasswordConfirmation from '../../components/PasswordConfirmation'
import Spinner from '../../components/Spinner'
import { useGlobalContext } from '../../contexts/global'
import { useModalContext } from '../../contexts/modal'
import { useTransactionsContext } from '../../contexts/transactions'
import { checkAddressValidity } from '../../utils/addresses'
import { getHumanReadableError, isHTTPError } from '../../utils/api'
import { MINIMAL_GAS_AMOUNT, MINIMAL_GAS_PRICE } from '../../utils/constants'
import { abbreviateAmount, convertScientificToFloatString, convertToQALPH } from '../../utils/numbers'

type StepIndex = 1 | 2 | 3

const SendPage = () => {
  const history = useHistory()
  const theme = useTheme()
  const {
    client,
    wallet,
    setSnackbarMessage,
    settings: {
      general: { passwordRequirement }
    }
  } = useGlobalContext()
  const { addPendingTx } = useTransactionsContext()
  const { setModalTitle, onModalClose, setOnModalClose } = useModalContext()
  const initialOnModalClose = useRef(onModalClose)
  const [transactionData, setTransactionData] = useState<TransactionData>({
    address: '',
    amount: '',
    gasAmount: undefined,
    gasPrice: undefined
  })
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState<StepIndex>(1)
  const [isConsolidateUTXOsModalVisible, setIsConsolidateUTXOsModalVisible] = useState(false)
  const [isConsolidating, setIsConsolidating] = useState(false)
  const [consolidationRequired, setConsolidationRequired] = useState(false)
  const [builtTxId, setBuiltTxId] = useState('')
  const [builtUnsignedTx, setBuiltUnsignedTx] = useState('')

  useEffect(() => {
    if (step === 1) {
      setModalTitle('Send')
      setOnModalClose(() => initialOnModalClose.current)
    } else if (step === 2) {
      setModalTitle('Info Check')
      setOnModalClose(() => () => setStep(1))
    } else if (step === 3) {
      setModalTitle('Password Check')
      setOnModalClose(() => () => setStep(1))
    }
  }, [setStep, setModalTitle, setOnModalClose, step])

  const confirmPassword = () => {
    if (consolidationRequired) setIsConsolidateUTXOsModalVisible(false)
    setStep(3)
  }

  const buildTransaction = async (transactionData: TransactionData) => {
    setTransactionData(transactionData)

    const { address, amount, gasAmount, gasPrice } = transactionData
    const isDataComplete = address && amount

    if (wallet && client && isDataComplete) {
      setIsLoading(true)

      const fullAmount = convertToQALPH(amount).toString()

      try {
        const txCreateResp = await client.clique.transactionCreate(
          wallet.address,
          wallet.publicKey,
          address,
          fullAmount,
          undefined,
          gasAmount ? parseInt(gasAmount) : undefined,
          gasPrice ? convertToQALPH(gasPrice).toString() : undefined
        )
        setBuiltTxId(txCreateResp.data.txId)
        setBuiltUnsignedTx(txCreateResp.data.unsignedTx)
        setStep(2)
      } catch (e) {
        // TODO: When API error codes are available, replace this substring check with a proper error code check
        if (
          isHTTPError(e) &&
          e.error?.detail &&
          (e.error.detail.includes('consolidating') || e.error.detail.includes('consolidate'))
        ) {
          setIsConsolidateUTXOsModalVisible(true)
          setConsolidationRequired(true)
        } else {
          setSnackbarMessage({
            text: getHumanReadableError(e, 'Error while building the transaction'),
            type: 'alert',
            duration: 5000
          })
        }
      }

      setIsLoading(false)
    }
  }

  const handleSend = async () => {
    const { address, amount } = transactionData

    if (builtTxId && builtUnsignedTx && wallet && address) {
      setIsLoading(true)

      try {
        const txSendResp = await signAndSendTransaction(builtTxId, builtUnsignedTx, address, wallet.privateKey)

        if (txSendResp) {
          const fullAmount = convertToQALPH(amount).toString()

          addPendingTx({
            txId: txSendResp.data.txId,
            toAddress: address,
            timestamp: new Date().getTime(),
            amount: fullAmount,
            type: 'transfer'
          })
        }

        setSnackbarMessage({ text: 'Transaction sent!', type: 'success' })
        history.push('/wallet')
      } catch (e) {
        console.error(e)
        setSnackbarMessage({
          text: getHumanReadableError(e, 'Error while sending the transaction'),
          type: 'alert',
          duration: 5000
        })
      }

      setIsLoading(false)
    }
  }

  const consolidateUTXOs = async () => {
    if (client && wallet) {
      setIsConsolidating(true)
      try {
        const txCreateResp = await client.clique.transactionConsolidateUTXOs(
          wallet.publicKey,
          wallet.address,
          wallet.address
        )
        for (const { txId, unsignedTx } of txCreateResp.data.unsignedTxs) {
          const txSendResp = await signAndSendTransaction(txId, unsignedTx, wallet.address, wallet.privateKey)
          if (txSendResp) {
            addPendingTx({
              txId: txSendResp.data.txId,
              toAddress: wallet.address,
              timestamp: new Date().getTime(),
              amount: '',
              type: 'consolidation'
            })
          }
        }

        setSnackbarMessage({
          text: 'Consolidation process in progress. You can try to send your transaction again once the pending consolidation transactions have been confirmed.',
          type: 'info',
          duration: 15000
        })
        setIsConsolidateUTXOsModalVisible(false)
        initialOnModalClose.current()
      } catch (e) {
        setSnackbarMessage({
          text: getHumanReadableError(e, 'Error while consolidating UTXOs'),
          type: 'alert',
          duration: 5000
        })
      }
      setIsConsolidating(false)
    }
  }

  const signAndSendTransaction = async (txId: string, unsignedTx: string, toAddress: string, privateKey: string) => {
    if (!client) return
    const signature = client.clique.transactionSign(txId, privateKey)
    return await client.clique.transactionSend(toAddress, unsignedTx, signature)
  }

  return (
    <>
      <HeaderContent>
        <HeaderLogo>
          {isLoading ? <Spinner size="30%" /> : <Send color={theme.global.accent} size={'70%'} strokeWidth={0.7} />}
        </HeaderLogo>
      </HeaderContent>
      {step === 1 && <TransactionForm data={transactionData} onSubmit={buildTransaction} />}
      {step === 2 && (
        <CheckTransactionContent
          data={transactionData}
          onSend={passwordRequirement ? confirmPassword : consolidationRequired ? consolidateUTXOs : handleSend}
        />
      )}
      {step === 3 && passwordRequirement && (
        <PasswordConfirmation
          text="Enter your password to send the transaction."
          buttonText="Send"
          onCorrectPasswordEntered={consolidationRequired ? consolidateUTXOs : handleSend}
        />
      )}
      {isConsolidateUTXOsModalVisible && (
        <ConsolidateUTXOsModal
          onClose={() => setIsConsolidateUTXOsModalVisible(false)}
          onConsolidateClick={passwordRequirement ? confirmPassword : consolidateUTXOs}
          isConsolidating={isConsolidating}
        />
      )}
    </>
  )
}

interface TransactionData {
  address: string
  amount: string
  gasAmount: string | undefined
  gasPrice: string | undefined
}

interface TransactionFormProps {
  data: TransactionData
  onSubmit: (data: TransactionData) => void
}

const TransactionForm = ({ data, onSubmit }: TransactionFormProps) => {
  const [addressState, setAddress] = useState(data.address)
  const [amountState, setAmount] = useState(data.amount)
  const [gasAmountState, setGasAmount] = useState(data.gasAmount)
  const [gasPriceState, setGasPrice] = useState(data.gasPrice)
  const [addressError, setAddressError] = useState('')
  const [gasAmountError, setGasAmountError] = useState('')
  const [gasPriceError, setGasPriceError] = useState('')
  const minimalGasPriceInALPH = abbreviateAmount(MINIMAL_GAS_PRICE)

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
      minAmount: BigInt(MINIMAL_GAS_AMOUNT),
      stateSetter: setGasAmount,
      errorMessage: `Gas amount must be greater than ${MINIMAL_GAS_AMOUNT}.`,
      currentErrorState: gasAmountError,
      errorStateSetter: setGasAmountError
    })
  }

  const handleGasPriceChange = (newPrice: string) => {
    onAmountInputValueChange({
      amount: newPrice,
      minAmount: MINIMAL_GAS_PRICE,
      stateSetter: setGasPrice,
      errorMessage: `Gas price must be greater than ${abbreviateAmount(MINIMAL_GAS_PRICE)}ℵ.`,
      currentErrorState: gasPriceError,
      errorStateSetter: setGasPriceError,
      shouldConvertToQALPH: true
    })
  }

  const expectedFeeInALPH = gasAmountState && gasPriceState && getExpectedFee(gasAmountState, gasPriceState)

  const isSubmitButtonActive = addressState && amountState && !addressError && !gasPriceError && !gasAmountError

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
        {expectedFeeInALPH && <InfoBox short label="Expected fee" text={`${expectedFeeInALPH} ℵ`} />}
      </Section>
      <ExpandableSection sectionTitle="Advanced settings">
        <Input
          id="gas-amount"
          placeholder="Gas amount"
          value={gasAmountState}
          onChange={(e) => handleGasAmountChange(e.target.value)}
          type="number"
          min={MINIMAL_GAS_AMOUNT}
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
          onClick={() =>
            onSubmit({
              address: addressState,
              amount: amountState,
              gasAmount: gasAmountState,
              gasPrice: gasPriceState
            })
          }
          disabled={!isSubmitButtonActive}
        >
          Check
        </Button>
      </Section>
    </>
  )
}

interface CheckTransactionContentProps {
  data: TransactionData
  onSend: () => void
}

const CheckTransactionContent = ({ data, onSend }: CheckTransactionContentProps) => {
  const isSendButtonActive = data.address.length > 0 && data.amount.length > 0

  return (
    <>
      <Section>
        <InfoBox text={data.address} label="Recipient's address" wordBreak />
        <InfoBox text={`${data.amount} ℵ`} label="Amount" />
        {data.gasAmount && <InfoBox text={data.gasAmount} label="Gas amount" />}
        {data.gasPrice && <InfoBox text={`${data.gasPrice} ℵ`} label="Gas price" />}
        {data.gasAmount && data.gasPrice && (
          <InfoBox text={`${getExpectedFee(data.gasAmount, data.gasPrice)} ℵ`} label="Expected fee" />
        )}
      </Section>
      <Section inList>
        <Button onClick={onSend} disabled={!isSendButtonActive}>
          Send
        </Button>
      </Section>
    </>
  )
}

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

  if (amountNumber && amountNumber < minAmount) {
    errorStateSetter(errorMessage)
  } else {
    if (currentErrorState) errorStateSetter('')
  }

  let cleanedAmount = amount

  if (amount.includes('e')) {
    cleanedAmount = convertScientificToFloatString(amount)
  }

  stateSetter(cleanedAmount)
}

const getExpectedFee = (gasAmount: string, gasPriceInALPH: string) => {
  return abbreviateAmount(BigInt(gasAmount) * convertToQALPH(gasPriceInALPH), false, 7)
}

export default SendPage
