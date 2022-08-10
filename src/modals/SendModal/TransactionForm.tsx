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

import { convertAlphToSet, formatAmountForDisplay } from '@alephium/sdk'
import { ReactNode, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { useTheme } from 'styled-components'

import AlefSymbol from '../../components/AlefSymbol'
import ExpandableSection from '../../components/ExpandableSection'
import InfoBox from '../../components/InfoBox'
import AddressSelect from '../../components/Inputs/AddressSelect'
import AmountInput from '../../components/Inputs/AmountInput'
import Input from '../../components/Inputs/Input'
import { useAddressesContext } from '../../contexts/addresses'
import { checkAddressValidity } from '../../utils/addresses'
import { MINIMAL_GAS_AMOUNT, MINIMAL_GAS_PRICE } from '../../utils/constants'
import { isAmountWithinRange } from '../../utils/transactions'
import { ModalFooterButton, ModalFooterButtons } from '../CenteredModal'
import { SendTransactionData } from '.'

interface TransactionFormProps {
  data: SendTransactionData | undefined
  onSubmit: (data: SendTransactionData) => void
  onCancel: () => void
}

const SendModalTransactionForm = ({ data, onSubmit, onCancel }: TransactionFormProps) => {
  const { t } = useTranslation('App')
  const { addresses, mainAddress } = useAddressesContext()
  const [fromAddress, setFromAddress] = useState(data?.fromAddress ?? mainAddress)
  const [toAddress, setToAddress] = useState(data?.toAddress ?? '')
  const [amount, setAmount] = useState(data?.amount ?? '')
  const [gasAmount, setGasAmount] = useState(data?.gasAmount ?? '')
  const [gasPrice, setGasPrice] = useState(data?.gasPrice ?? '')
  const [addressError, setToAddressError] = useState('')
  const [gasAmountError, setGasAmountError] = useState<ReactNode>()
  const minimalGasPriceInALPH = formatAmountForDisplay(MINIMAL_GAS_PRICE)
  const [gasPriceError, setGasPriceError] = useState<ReactNode>()
  const theme = useTheme()

  const handleAddressChange = (value: string) => {
    setToAddress(value)
    const validValue = checkAddressValidity(value)

    if (validValue) {
      setToAddress(validValue)
      setToAddressError('')
    } else {
      setToAddressError(t`Address format is incorrect`)
    }
  }

  const handleGasAmountChange = (newAmount: string) => {
    onAmountInputValueChange({
      amount: newAmount,
      minAmount: BigInt(MINIMAL_GAS_AMOUNT),
      stateSetter: setGasAmount,
      errorMessage: t('Gas amount must be greater than {{ MINIMAL_GAS_AMOUNT }}.', { MINIMAL_GAS_AMOUNT }),
      currentErrorState: gasAmountError,
      errorStateSetter: setGasAmountError
    })
  }

  const handleGasPriceChange = (newPrice: string) => {
    onAmountInputValueChange({
      amount: newPrice,
      minAmount: MINIMAL_GAS_PRICE,
      stateSetter: setGasPrice,
      errorMessage: (
        <>
          {t('Gas price must be greater than {{ amount }}', {
            amount: formatAmountForDisplay(MINIMAL_GAS_PRICE, true)
          })}
          <AlefSymbol color={theme.global.alert} />.
        </>
      ),
      currentErrorState: gasPriceError,
      errorStateSetter: setGasPriceError,
      shouldConvertToSet: true
    })
  }

  const expectedFeeInALPH = gasAmount && gasPrice && getExpectedFee(gasAmount, gasPrice)

  if (!fromAddress) return null

  const isSubmitButtonActive =
    toAddress &&
    !addressError &&
    !gasPriceError &&
    !gasAmountError &&
    amount &&
    isAmountWithinRange(convertAlphToSet(amount), fromAddress.availableBalance)

  return (
    <>
      <ModalContent>
        <AddressSelect
          label={t`From address`}
          title={t`Select the address to send funds from.`}
          options={addresses}
          defaultAddress={fromAddress}
          onAddressChange={(newAddress) => setFromAddress(newAddress)}
          id="from-address"
          hideEmptyAvailableBalance
        />
        <Input
          label={t`Recipient's address`}
          value={toAddress}
          onChange={(e) => handleAddressChange(e.target.value)}
          error={addressError}
          isValid={toAddress.length > 0 && !addressError}
        />
        <AmountInput value={amount} onChange={setAmount} availableAmount={fromAddress.availableBalance} />
        {expectedFeeInALPH && (
          <InfoBoxStyled short label={t`Expected fee`}>
            {expectedFeeInALPH}
            <AlefSymbol />
          </InfoBoxStyled>
        )}
      </ModalContent>
      <ExpandableSectionStyled sectionTitleClosed={t`Advanced settings`}>
        <Input
          id="gas-amount"
          label={t`Gas amount`}
          value={gasAmount}
          onChange={(e) => handleGasAmountChange(e.target.value)}
          type="number"
          min={MINIMAL_GAS_AMOUNT}
          error={gasAmountError}
        />
        <Input
          id="gas-price"
          label={
            <>
              {t`Gas price`} (<AlefSymbol color={theme.font.secondary} />)
            </>
          }
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
          {t`Cancel`}
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
          {t`Check`}
        </ModalFooterButton>
      </ModalFooterButtons>
    </>
  )
}

const getExpectedFee = (gasAmount: string, gasPriceInALPH: string) =>
  formatAmountForDisplay(BigInt(gasAmount) * convertAlphToSet(gasPriceInALPH), true)

const onAmountInputValueChange = ({
  amount,
  minAmount,
  stateSetter,
  errorMessage,
  currentErrorState,
  errorStateSetter,
  shouldConvertToSet
}: {
  amount: string
  minAmount: bigint
  errorMessage: ReactNode
  stateSetter: (v: string) => void
  currentErrorState: ReactNode
  errorStateSetter: (v: ReactNode) => void
  shouldConvertToSet?: boolean
}) => {
  let amountNumber

  try {
    amountNumber = shouldConvertToSet ? convertAlphToSet(amount || '0') : BigInt(amount)
  } catch (e) {
    console.log(e)
    return
  }

  if (amountNumber && amountNumber < minAmount) {
    errorStateSetter(errorMessage)
  } else {
    if (currentErrorState) errorStateSetter('')
  }

  stateSetter(amount)
}

export default SendModalTransactionForm

const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
`

const ExpandableSectionStyled = styled(ExpandableSection)`
  margin-top: 38px;
`

const InfoBoxStyled = styled(InfoBox)`
  margin-top: var(--spacing-5);
`
