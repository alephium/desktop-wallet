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
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import Input from '@/components/Inputs/Input'
import AlphAmountInfoBox from '@/modals/SendModals/AlphAmountInfoBox'

export interface GasSettingsProps {
  gasAmount?: string
  gasAmountError: string
  gasPrice?: string
  gasPriceError: string
  onGasAmountChange: (v: string) => void
  onGasPriceChange: (v: string) => void
}

const GasSettings = ({
  gasAmount,
  gasAmountError,
  gasPrice,
  gasPriceError,
  onGasAmountChange,
  onGasPriceChange
}: GasSettingsProps) => {
  const { t } = useTranslation()
  const posthog = usePostHog()

  const [expectedFee, setExpectedFee] = useState<bigint>()

  const minimalGasPriceInALPH = formatAmountForDisplay({ amount: MINIMAL_GAS_PRICE, fullPrecision: true })

  useEffect(() => {
    if (!gasAmount || !gasPrice) return

    try {
      setExpectedFee(BigInt(gasAmount) * fromHumanReadableAmount(gasPrice))
    } catch (e) {
      console.error(e)
      posthog.capture('Error', { message: 'Could not set expected fee' })
    }
  }, [gasAmount, gasPrice, posthog])

  return (
    <>
      <Input
        id="gas-amount"
        label={`${t('Gas amount')} (≥ ${MINIMAL_GAS_AMOUNT})`}
        value={gasAmount ?? ''}
        onChange={(e) => onGasAmountChange(e.target.value)}
        type="number"
        min={MINIMAL_GAS_AMOUNT}
        error={gasAmountError}
      />
      <Input
        id="gas-price"
        label={
          <>
            {t`Gas price`} (≥ {minimalGasPriceInALPH} ALPH)
          </>
        }
        value={gasPrice ?? ''}
        type="number"
        min={minimalGasPriceInALPH}
        onChange={(e) => onGasPriceChange(e.target.value)}
        step={minimalGasPriceInALPH}
        error={gasPriceError}
      />
      {expectedFee && <AlphAmountInfoBox label={t`Expected fee`} amount={expectedFee} short />}
    </>
  )
}

export default GasSettings
