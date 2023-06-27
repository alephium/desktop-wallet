/*
Copyright 2018 - 2023 The Alephium Authors
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

import { formatAmountForDisplay, fromHumanReadableAmount, MINIMAL_GAS_AMOUNT, MINIMAL_GAS_PRICE } from '@alephium/sdk'
import { usePostHog } from 'posthog-js/react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

const useGasSettings = (initialGasAmount?: string, initialGasPrice?: string) => {
  const { t } = useTranslation()
  const posthog = usePostHog()

  const [gasAmount, setGasAmount] = useState(initialGasAmount)
  const [gasPrice, setGasPrice] = useState(initialGasPrice)
  const [gasAmountError, setGasAmountError] = useState('')
  const [gasPriceError, setGasPriceError] = useState('')

  const clearGasSettings = () => {
    setGasAmount('')
    setGasPrice('')
    setGasPriceError('')
    setGasAmountError('')
  }

  const handleGasAmountChange = (newAmount: string) => {
    setGasAmount(newAmount)
    setGasAmountError(
      newAmount && parseInt(newAmount) < MINIMAL_GAS_AMOUNT
        ? t('Gas amount must be greater than {{ MINIMAL_GAS_AMOUNT }}.', { MINIMAL_GAS_AMOUNT })
        : ''
    )
  }

  const handleGasPriceChange = (newPrice: string) => {
    let newPriceNumber

    try {
      newPriceNumber = fromHumanReadableAmount(newPrice || '0')

      setGasPrice(newPrice)
      setGasPriceError(
        newPriceNumber && newPriceNumber < MINIMAL_GAS_PRICE
          ? t('Gas price must be greater than {{ amount }}', {
              amount: formatAmountForDisplay({ amount: MINIMAL_GAS_PRICE, fullPrecision: true })
            })
          : ''
      )
    } catch (e) {
      console.error(e)
      posthog.capture('Error', { message: 'Setting gas price' })
      return
    }
  }

  return {
    gasAmount,
    gasAmountError,
    gasPrice,
    gasPriceError,
    clearGasSettings,
    handleGasAmountChange,
    handleGasPriceChange
  }
}

export default useGasSettings
