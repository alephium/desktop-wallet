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

import { abbreviateAmount, convertAlphToSet, convertScientificToFloatString } from 'alephium-js/dist/lib/numbers'
import { useState } from 'react'
import styled from 'styled-components'

import ExpandableSection from '../../components/ExpandableSection'
import InfoBox from '../../components/InfoBox'
import AddressSelect from '../../components/Inputs/AddressSelect'
import AmountInput from '../../components/Inputs/AmountInput'
import Input from '../../components/Inputs/Input'
import { ModalFooterButton, ModalFooterButtons } from '../../components/Modal'
import { useAddressesContext } from '../../contexts/addresses'
import { checkAddressValidity } from '../../utils/addresses'
import { MINIMAL_GAS_AMOUNT, MINIMAL_GAS_PRICE } from '../../utils/constants'
import { isAmountValid } from '../../utils/transactions'
import { SendTransactionData } from './SendModal'

interface TransactionFormProps {
  data: SendTransactionData | undefined
  onSubmit: (data: SendTransactionData) => void
  onCancel: () => void
}

const SendModalTransactionForm = ({ data, onSubmit, onCancel }: TransactionFormProps) => {
  const { addresses, mainAddress } = useAddressesContext()
  const [fromAddress, setFromAddress] = useState(data?.fromAddress ?? mainAddress)
  const [toAddress, setToAddress] = useState(data?.toAddress ?? '')
  const [amount, setAmount] = useState(data?.amount ?? '')
  const [gasAmount, setGasAmount] = useState(data?.gasAmount ?? '')
  const [gasPrice, setGasPrice] = useState(data?.gasPrice ?? '')
  const [addressError, setToAddressError] = useState('')
  const [gasAmountError, setGasAmountError] = useState('')
  const minimalGasPriceInALPH = abbreviateAmount(MINIMAL_GAS_PRICE)
  const [gasPriceError, setGasPriceError] = useState('')

  const handleAddressChange = (value: string) => {
    setToAddress(value)
    const validValue = checkAddressValidity(value)

    if (validValue) {
      setToAddress(validValue)
      setToAddressError('')
    } else {
      setToAddressError('Address format is incorrect')
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
      errorMessage: `Gas price must be greater than ${abbreviateAmount(MINIMAL_GAS_PRICE, true)} ℵ.`,
      currentErrorState: gasPriceError,
      errorStateSetter: setGasPriceError,
      shouldConvertToQALPH: true
    })
  }

  const expectedFeeInALPH = gasAmount && gasPrice && getExpectedFee(gasAmount, gasPrice)

  if (!fromAddress) return null

  const isSubmitButtonActive =
    toAddress &&
    !addressError &&
    !gasPriceError &&
    !gasAmountError &&
    isAmountValid(convertAlphToSet(amount), fromAddress.availableBalance)

  return (
    <>
      <ModalContent>
        <AddressSelect
          placeholder="From address"
          title="Select the address to send funds from."
          options={addresses}
          defaultAddress={fromAddress}
          onAddressChange={(newAddress) => setFromAddress(newAddress)}
          id="from-address"
          hideEmptyAvailableBalance
        />
        <Input
          placeholder="Recipient's address"
          value={toAddress}
          onChange={(e) => handleAddressChange(e.target.value)}
          error={addressError}
          isValid={toAddress.length > 0 && !addressError}
        />
        <AmountInput value={amount} onChange={setAmount} availableAmount={fromAddress.availableBalance} />
        {expectedFeeInALPH && <InfoBox short label="Expected fee" text={`${expectedFeeInALPH} ℵ`} />}
      </ModalContent>
      <ExpandableSectionStyled sectionTitleClosed="Advanced settings">
        <Input
          id="gas-amount"
          placeholder="Gas amount"
          value={gasAmount}
          onChange={(e) => handleGasAmountChange(e.target.value)}
          type="number"
          min={MINIMAL_GAS_AMOUNT}
          error={gasAmountError}
        />
        <Input
          id="gas-price"
          placeholder="Gas price (ℵ)"
          value={gasPrice}
          type="number"
          min={minimalGasPriceInALPH}
          onChange={(e) => handleGasPriceChange(e.target.value)}
          step={minimalGasPriceInALPH}
          error={gasPriceError}
        />
      </ExpandableSectionStyled>
      <ModalFooterButtons>
        <ModalFooterButton secondary onClick={onCancel}>
          Cancel
        </ModalFooterButton>
        <ModalFooterButton
          onClick={() =>
            onSubmit({
              toAddress,
              amount,
              gasAmount,
              gasPrice,
              fromAddress
            })
          }
          disabled={!isSubmitButtonActive}
        >
          Check
        </ModalFooterButton>
      </ModalFooterButtons>
    </>
  )
}

const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
`

const getExpectedFee = (gasAmount: string, gasPriceInALPH: string) => {
  return abbreviateAmount(BigInt(gasAmount) * BigInt(convertAlphToSet(gasPriceInALPH)), false, 7)
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
    amountNumber = shouldConvertToQALPH ? BigInt(convertAlphToSet(amount)) : BigInt(amount)
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

const ExpandableSectionStyled = styled(ExpandableSection)`
  margin-top: 38px;
`

export default SendModalTransactionForm
