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
import styled, { useTheme } from 'styled-components'

import { GasInfo } from '../types/transactions'
import AlefSymbol from './AlefSymbol'
import ExpandableSection from './ExpandableSection'
import InfoBox from './InfoBox'
import GasAmountInput, { GasAmountWithParseInfo } from './Inputs/GasAmountInput'
import GasPriceInput, { GasPriceWithParseInfo } from './Inputs/GasPriceInput'

export interface GasSettingsExpandableSectionProps extends GasInfo {
  onGasAmountChange: (v: GasAmountWithParseInfo) => void
  onGasPriceChange: (v: GasPriceWithParseInfo) => void
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
      <InfoBoxStyled short label="Expected fee">
        {expectedFeeInALPH && (
          <>
            {expectedFeeInALPH} <AlefSymbol />
          </>
        )}
      </InfoBoxStyled>
    </ExpandableSectionStyled>
  )
}

export default GasSettingsExpandableSection

const ExpandableSectionStyled = styled(ExpandableSection)`
  margin-top: 38px;
`

const InfoBoxStyled = styled(InfoBox)`
  margin-top: var(--spacing-5);
`
