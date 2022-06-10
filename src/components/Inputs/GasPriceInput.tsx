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

import { formatAmountForDisplay } from '@alephium/sdk'
import { useCallback, useEffect, useState } from 'react'
import { DefaultTheme } from 'styled-components'

import { useStateWithParsed } from '../../hooks/useStateWithParsed'
import { WithParsed } from '../../types/data'
import { MINIMAL_GAS_PRICE } from '../../utils/constants'
import { getAmountErrorMessage } from '../../utils/transactions'
import AlefSymbol from '../AlefSymbol'
import Input from './Input'

export type GasPriceParsed = string | undefined
export type GasPriceWithParseInfo = WithParsed<GasPriceParsed>

export interface GasPriceInputProps {
  theme: DefaultTheme
  value: WithParsed<string | undefined>
  onChange: (value: GasPriceWithParseInfo) => void
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

export default GasPriceInput
