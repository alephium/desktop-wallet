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
import styled from 'styled-components'

import { useGlobalContext } from '../contexts/global'
import AlefSymbol from './AlefSymbol'

interface AmountProps {
  value: bigint | undefined
  fadeDecimals?: boolean
  fullPrecision?: boolean
  nbOfDecimalsToShow?: number
  color?: string
  tabIndex?: number
  className?: string
}

const Amount = ({
  value,
  className,
  fadeDecimals,
  fullPrecision = false,
  color,
  nbOfDecimalsToShow,
  tabIndex
}: AmountProps) => {
  const {
    settings: {
      general: { discreetMode }
    }
  } = useGlobalContext()
  let integralPart = ''
  let fractionalPart = ''
  let suffix = ''

  if (!discreetMode && value !== undefined) {
    let amount = formatAmountForDisplay(value, fullPrecision, nbOfDecimalsToShow)
    if (fadeDecimals && ['K', 'M', 'B', 'T'].some((char) => amount.endsWith(char))) {
      suffix = amount.slice(-1)
      amount = amount.slice(0, -1)
    }
    const amountParts = amount.split('.')
    integralPart = amountParts[0]
    fractionalPart = amountParts[1]
  }

  return (
    <span className={className} tabIndex={tabIndex ?? -1}>
      {discreetMode ? (
        '•••'
      ) : value !== undefined ? (
        fadeDecimals ? (
          <>
            <span>{integralPart}</span>
            <Decimals>.{fractionalPart}</Decimals>
            {suffix && <span>{suffix}</span>}
          </>
        ) : (
          `${integralPart}.${fractionalPart}`
        )
      ) : (
        '-'
      )}
      <AlefSymbol color={color} />
    </span>
  )
}

export default styled(Amount)`
  color: ${({ theme, color }) => color ?? theme.font.primary};
`

const Decimals = styled.span`
  opacity: 0.7;
`
