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

import { useCallback } from 'react'

import { useStateWithParsed } from '../../hooks/useStateWithParsed'
import { WithParsed } from '../../types/data'
import { MINIMAL_GAS_AMOUNT } from '../../utils/constants'
import { getAmountErrorMessage } from '../../utils/transactions'
import Input from './Input'

export type GasAmountParsed = number | undefined
export type GasAmountWithParseInfo = WithParsed<GasAmountParsed>

export interface GasAmountInputProps {
  value: GasAmountWithParseInfo
  onChange: (value: GasAmountWithParseInfo) => void
}

const GasAmountInput = ({ value, onChange }: GasAmountInputProps) => {
  const [gasAmount, setGasAmount] = useStateWithParsed<GasAmountParsed>(
    value.parsed,
    value.parsed !== undefined ? value.parsed.toString() : ''
  )

  const handleGasAmountChange = useCallback(
    (newGasAmount: string) => {
      if (newGasAmount === '') {
        setGasAmount('', undefined, '')
        return
      }
      const errorMessage = getAmountErrorMessage(newGasAmount, BigInt(MINIMAL_GAS_AMOUNT), false)
      setGasAmount(newGasAmount, !errorMessage ? parseInt(newGasAmount) : undefined, errorMessage)
      onChange(gasAmount)
    },
    [setGasAmount, gasAmount, onChange]
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

export default GasAmountInput
