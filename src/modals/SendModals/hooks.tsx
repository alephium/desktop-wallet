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
import { useState } from 'react'
import styled, { DefaultTheme, useTheme } from 'styled-components'

import AlefSymbol from '../../components/AlefSymbol'
import ExpandableSection from '../../components/ExpandableSection'
import InfoBox from '../../components/InfoBox'
import AddressSelect from '../../components/Inputs/AddressSelect'
import AmountInput from '../../components/Inputs/AmountInput'
import Input from '../../components/Inputs/Input'
import { Address, useAddressesContext } from '../../contexts/addresses'
import { MINIMAL_GAS_AMOUNT, MINIMAL_GAS_PRICE } from '../../utils/constants'

export const useBytecodeInputComponent = (initialBytecode: string) => {
  const [bytecode, setBytecode] = useState(initialBytecode)
  const BytecodeInput = (
    <Input id="code" label="bytecode" value={bytecode} onChange={(e) => setBytecode(e.target.value)} />
  )

  return [bytecode, BytecodeInput] as const
}

export const useBuildTxCommonComponents = (
  initialFromAddress: Address,
  initialAlphAmount?: string,
  initialGasAmount?: number,
  initialGasPrice?: string
) => {
  const theme = useTheme()
  const { addresses } = useAddressesContext()
  const updatedInitialAddress = addresses.find((a) => a.hash === initialFromAddress.hash) ?? initialFromAddress
  const [fromAddress, setFromAddress] = useState(updatedInitialAddress)
  const [alphAmount, setAlphAmount] = useState(initialAlphAmount ?? '')
  const [gasAmount, setGasAmount] = useStateWithParsed<number | undefined>(
    initialGasAmount,
    initialGasAmount !== undefined ? initialGasAmount.toString() : ''
  )
  const [gasPrice, setGasPrice] = useStateWithParsed<string | undefined>(
    initialGasPrice,
    initialGasPrice !== undefined ? initialGasPrice : ''
  )

  const handleGasAmountChange = (newGasAmount: string) => {
    if (newGasAmount === '') {
      setGasAmount('', undefined, '')
      return
    }
    const errorMessage = getAmountErrorMessage(newGasAmount, BigInt(MINIMAL_GAS_AMOUNT), false)
    setGasAmount(newGasAmount, !errorMessage ? parseInt(newGasAmount) : undefined, errorMessage)
  }

  const handleGasPriceChange = (newGasPrice: string) => {
    if (newGasPrice === '') {
      setGasPrice('', undefined, '')
      return
    }
    const errorMessage = getAmountErrorMessage(newGasPrice, MINIMAL_GAS_PRICE, true)
    setGasPrice(newGasPrice, !errorMessage ? newGasPrice : undefined, errorMessage)
  }

  const expectedFeeInALPH =
    gasAmount.parsed !== undefined && gasPrice.parsed !== undefined
      ? formatAmountForDisplay(BigInt(gasAmount.parsed) * convertAlphToSet(gasPrice.parsed), true)
      : ''

  const isCommonReady = !gasAmount.error && !gasPrice.error

  const FromAddressSelect = (
    <AddressSelect
      label="From address"
      title="Select the address to send funds from."
      options={addresses}
      defaultAddress={updatedInitialAddress}
      onAddressChange={(newAddress) => setFromAddress(newAddress)}
      id="from-address"
      hideEmptyAvailableBalance
    />
  )

  const AlphAmountInput = (
    <AmountInput value={alphAmount} onChange={setAlphAmount} availableAmount={fromAddress.availableBalance} />
  )

  const GasSettingsExpandableSection = (
    <ExpandableSectionStyled sectionTitleClosed="Gas">
      <GasAmountInput gasAmount={gasAmount} handleGasAmountChange={handleGasAmountChange} />
      <GasPriceInput theme={theme} gasPrice={gasPrice} handleGasPriceChange={handleGasPriceChange} />
      <InfoBoxStyled short label="Expected fee">
        {expectedFeeInALPH && (
          <>
            {expectedFeeInALPH} <AlefSymbol />
          </>
        )}
      </InfoBoxStyled>
    </ExpandableSectionStyled>
  )

  return [
    fromAddress,
    FromAddressSelect,
    alphAmount,
    AlphAmountInput,
    gasAmount,
    gasPrice,
    GasSettingsExpandableSection,
    isCommonReady
  ] as const
}

type WithParsed<T> = { raw: string; parsed: T; error: string }

interface GasAmountInputProps {
  gasAmount: WithParsed<number | undefined>
  handleGasAmountChange: (error: string) => void
}

const GasAmountInput = ({ gasAmount, handleGasAmountChange }: GasAmountInputProps) => (
  <Input
    id="gas-amount"
    label={`Gas amount (≥ ${MINIMAL_GAS_AMOUNT})`}
    value={gasAmount.raw}
    onChange={(e) => handleGasAmountChange(e.target.value)}
    type="number"
    min={MINIMAL_GAS_AMOUNT}
    error={gasAmount.error}
  />
)

interface GasPriceInputProps {
  theme: DefaultTheme
  gasPrice: WithParsed<string | undefined>
  handleGasPriceChange: (error: string) => void
}

const GasPriceInput = ({ theme, gasPrice, handleGasPriceChange }: GasPriceInputProps) => {
  const minimalGasPriceInALPH = formatAmountForDisplay(MINIMAL_GAS_PRICE, true)

  return (
    <Input
      id="gas-price"
      label={
        <>
          Gas price (≥ {minimalGasPriceInALPH} <AlefSymbol color={theme.font.secondary} />)
        </>
      }
      value={gasPrice.raw}
      type="number"
      min={minimalGasPriceInALPH}
      onChange={(e) => handleGasPriceChange(e.target.value)}
      step={minimalGasPriceInALPH}
      error={gasPrice.error}
    />
  )
}

function useStateWithParsed<T>(initialValue: T, stringified: string) {
  const [value, setValue] = useState<WithParsed<T>>({
    parsed: initialValue,
    raw: stringified,
    error: ''
  })

  const setValueWithError = (newValue: string, parsed: T, newError: string) => {
    setValue({ parsed: parsed, raw: newValue, error: newError })
  }

  return [value, setValueWithError] as const
}

const getAmountErrorMessage = (amount: string, minAmount: bigint, shouldConvertToSet: boolean): string => {
  try {
    const amountNumber = shouldConvertToSet ? convertAlphToSet(amount || '0') : BigInt(amount)
    if (amountNumber < minAmount) {
      return `The amount must be greater than ${minAmount}`
    }
  } catch (e) {
    return 'Unable to convert the amount'
  }
  return ''
}

const ExpandableSectionStyled = styled(ExpandableSection)`
  margin-top: 38px;
`

const InfoBoxStyled = styled(InfoBox)`
  margin-top: var(--spacing-5);
`
