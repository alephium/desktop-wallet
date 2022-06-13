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
import { useCallback, useEffect, useState } from 'react'
import styled, { DefaultTheme, useTheme } from 'styled-components'

import AlefSymbol from '../../components/AlefSymbol'
import ExpandableSection from '../../components/ExpandableSection'
import InfoBox from '../../components/InfoBox'
import Input from '../../components/Inputs/Input'
import { useStateWithParsed } from '../../hooks/useStateWithParsed'
import { WithParsed } from '../../types/data'
import { GasInfo } from '../../types/transactions'
import { MINIMAL_GAS_AMOUNT, MINIMAL_GAS_PRICE } from '../../utils/constants'
import { getAmountErrorMessage } from '../../utils/transactions'

export interface GasSettingsExpandableSectionProps extends GasInfo {
  onGasAmountChange: (v: GasAmountWithParseInfo) => void
  onGasPriceChange: (v: GasPriceWithParseInfo) => void
}

type GasPriceParsed = string | undefined
type GasPriceWithParseInfo = WithParsed<GasPriceParsed>
interface GasPriceInputProps {
  theme: DefaultTheme
  value: WithParsed<string | undefined>
  onChange: (value: GasPriceWithParseInfo) => void
}

type GasAmountParsed = number | undefined
type GasAmountWithParseInfo = WithParsed<GasAmountParsed>
interface GasAmountInputProps {
  value: GasAmountWithParseInfo
  onChange: (value: GasAmountWithParseInfo) => void
}

const GasSettingsExpandableSection = ({
  gasAmount,
  gasPrice,
  onGasAmountChange,
  onGasPriceChange
}: GasSettingsExpandableSectionProps) => {
  const theme = useTheme()

  const expectedFeeInALPH =
    gasAmount.parsed !== undefined && gasPrice.parsed !== undefined
      ? formatAmountForDisplay(BigInt(gasAmount.raw) * convertAlphToSet(gasPrice.raw), true)
      : ''

  return (
    <ExpandableSectionStyled sectionTitleClosed="Gas">
      <GasAmountInput value={gasAmount} onChange={onGasAmountChange} />
      <GasPriceInput theme={theme} value={gasPrice} onChange={onGasPriceChange} />
      {expectedFeeInALPH && (
        <InfoBox short label="Expected fee">
          {expectedFeeInALPH} <AlefSymbol />
        </InfoBox>
      )}
    </ExpandableSectionStyled>
  )
}

const GasAmountInput = ({ value, onChange }: GasAmountInputProps) => {
  const [gasAmount, setGasAmount] = useStateWithParsed<GasAmountParsed>(
    value.parsed,
    value.parsed !== undefined ? value.parsed.toString() : ''
  )
  const [prevGasAmount, setPrevGasAmount] = useState(gasAmount)

  useEffect(() => {
    if (prevGasAmount != gasAmount) {
      onChange(gasAmount)
      setPrevGasAmount(gasAmount)
    }
  }, [prevGasAmount, gasAmount, onChange])

  const handleGasAmountChange = useCallback(
    (newGasAmount: string) => {
      if (newGasAmount === '') {
        setGasAmount('', undefined, '')
        return
      }
      const errorMessage = getAmountErrorMessage(newGasAmount, BigInt(MINIMAL_GAS_AMOUNT), false)
      setGasAmount(newGasAmount, !errorMessage ? parseInt(newGasAmount) : undefined, errorMessage)
    },
    [setGasAmount]
  )

  return (
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
}

const GasPriceInput = ({ theme, value, onChange }: GasPriceInputProps) => {
  const [gasPrice, setGasPrice] = useStateWithParsed<GasPriceParsed>(
    value.parsed,
    value.parsed !== undefined ? value.parsed : ''
  )
  const [prevGasPrice, setPrevGasPrice] = useState(gasPrice)

  useEffect(() => {
    if (prevGasPrice != gasPrice) {
      onChange(gasPrice)
      setPrevGasPrice(gasPrice)
    }
  }, [prevGasPrice, gasPrice, onChange])

  const handleGasPriceChange = useCallback(
    (newGasPrice: string) => {
      if (newGasPrice === '') {
        setGasPrice('', undefined, '')
        return
      }
      const errorMessage = getAmountErrorMessage(newGasPrice, MINIMAL_GAS_PRICE, true)
      setGasPrice(newGasPrice, !errorMessage ? newGasPrice : undefined, errorMessage)
    },
    [setGasPrice]
  )

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

export default GasSettingsExpandableSection

const ExpandableSectionStyled = styled(ExpandableSection)`
  margin-top: 38px;
`
