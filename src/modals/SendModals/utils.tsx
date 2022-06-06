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
import { ModalFooterButton, ModalFooterButtons } from '../CenteredModal'

export type PartialTxData<T, K extends keyof T> = {
  [P in keyof Omit<T, K>]?: T[P]
} & Pick<T, K>

export const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
`

const ExpandableSectionStyled = styled(ExpandableSection)`
  margin-top: 38px;
`

export const InfoBoxStyled = styled(InfoBox)`
  margin-top: var(--spacing-5);
`

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

type WithError<T> = { value: T; error: string }

type WithParsed<T> = { raw: string; parsed: T; error: string }

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

function useFromAddress(initialAddress: Address) {
  const { addresses } = useAddressesContext()
  const updatedInitialAddress = addresses.find((a) => a.hash === initialAddress.hash) ?? initialAddress

  const [fromAddress, setFromAddress] = useState(updatedInitialAddress)
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

  return [fromAddress, FromAddressSelect] as const
}

export function useBytecode(initialBytecode: string) {
  const [bytecode, setBytecode] = useState(initialBytecode)
  const BytecodeInput = (
    <Input id="code" label="bytecode" value={bytecode} onChange={(e) => setBytecode(e.target.value)} />
  )

  return [bytecode, BytecodeInput] as const
}

export function useBuildTxCommon(
  initialFromAddress: Address,
  initialAlphAmount: string | undefined,
  initialGasAmount: number | undefined,
  initialGasPrice: string | undefined
) {
  const theme = useTheme()
  const [fromAddress, FromAddressSelect] = useFromAddress(initialFromAddress)
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

export const ToAddressInput = ({
  toAddress,
  handleAddressChange
}: {
  toAddress: WithError<string>
  handleAddressChange: (address: string) => void
}) => (
  <Input
    label="Recipient's address"
    value={toAddress.value}
    onChange={(e) => handleAddressChange(e.target.value)}
    error={toAddress.error}
    isValid={toAddress.value.length > 0 && !toAddress.error}
  />
)

const GasAmountInput = ({
  gasAmount,
  handleGasAmountChange
}: {
  gasAmount: WithParsed<number | undefined>
  handleGasAmountChange: (error: string) => void
}) => (
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

const GasPriceInput = ({
  theme,
  gasPrice,
  handleGasPriceChange
}: {
  theme: DefaultTheme
  gasPrice: WithParsed<string | undefined>
  handleGasPriceChange: (error: string) => void
}) => {
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

export const SendTxModalFooterButtons = ({
  onSubmit,
  onCancel,
  isSubmitButtonActive
}: {
  onSubmit: () => void
  onCancel: () => void
  isSubmitButtonActive: boolean | string
}) => (
  <ModalFooterButtons>
    <ModalFooterButton secondary onClick={onCancel}>
      Cancel
    </ModalFooterButton>
    <ModalFooterButton onClick={onSubmit} disabled={!isSubmitButtonActive}>
      Check
    </ModalFooterButton>
  </ModalFooterButtons>
)

export function useIssueTokenAmount(initialTokenAmount: string | undefined) {
  const [issueTokenAmount, setIssueTokenAmount] = useState(initialTokenAmount ?? '')
  const IssueTokenAmount = (
    <Input
      id="issue-token-amount"
      label="Tokens to issue (optional)"
      value={issueTokenAmount}
      type="number"
      onChange={(e) => setIssueTokenAmount(e.target.value)}
    />
  )

  return [issueTokenAmount, IssueTokenAmount] as const
}

export const expectedAmount = (data: { fromAddress: Address; alphAmount?: string }, fees: bigint) => {
  const amountInSet = data.alphAmount ? convertAlphToSet(data.alphAmount) : 0n
  const amountIncludingFees = amountInSet + fees
  const exceededBy = amountIncludingFees - data.fromAddress.availableBalance
  const expectedAmount = exceededBy > 0 ? data.fromAddress.availableBalance - exceededBy : amountInSet
  return expectedAmount
}

export type CheckTxProps<T> = {
  data: T
  fees: bigint
  onSend: () => void
  onCancel: () => void
}

export const FromAddressInfo = ({ fromAddress }: { fromAddress: Address }) => (
  <InfoBox text={fromAddress.hash} label="From address" wordBreak />
)

export const AlphAmountInfo = ({ expectedAmount }: { expectedAmount: bigint }) => (
  <InfoBox label="Amount">
    {formatAmountForDisplay(expectedAmount, false, 7)} <AlefSymbol />
  </InfoBox>
)

export const FeeInfo = ({ fees }: { fees: bigint }) => (
  <InfoBox label="Expected fee">
    {formatAmountForDisplay(fees, true)} <AlefSymbol />
  </InfoBox>
)

export const BytecodeInfo = ({ bytecode }: { bytecode: string }) => (
  <InfoBox text={bytecode} label="Bytecode" wordBreak />
)

export const CheckTxFooter = ({ onSend, onCancel }: { onSend: () => void; onCancel: () => void }) => (
  <ModalFooterButtons>
    <ModalFooterButton secondary onClick={onCancel}>
      Back
    </ModalFooterButton>
    <ModalFooterButton onClick={onSend}>Send</ModalFooterButton>
  </ModalFooterButtons>
)
