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

import { formatAmountForDisplay, formatFiatAmountForDisplay } from '@alephium/sdk'
import styled from 'styled-components'

import AlefSymbol from '@/components/AlefSymbol'
import { useAppSelector } from '@/hooks/redux'

interface AmountProps {
  value?: bigint | number
  isFiat?: boolean
  fadeDecimals?: boolean
  fullPrecision?: boolean
  nbOfDecimalsToShow?: number
  color?: string
  tabIndex?: number
  suffix?: string
  className?: string
}

const Amount = ({
  value,
  isFiat,
  className,
  fadeDecimals,
  fullPrecision = false,
  color,
  nbOfDecimalsToShow,
  suffix,
  tabIndex
}: AmountProps) => {
  const { discreetMode } = useAppSelector((state) => state.settings)

  let integralPart = ''
  let fractionalPart = ''
  let quantitySymbol = ''

  if (!discreetMode) {
    let amount =
      value !== undefined
        ? isFiat && typeof value === 'number'
          ? formatFiatAmountForDisplay(value)
          : formatAmountForDisplay(value as bigint, fullPrecision, nbOfDecimalsToShow)
        : ''
    if (amount) {
      if (fadeDecimals && ['K', 'M', 'B', 'T'].some((char) => amount.endsWith(char))) {
        quantitySymbol = amount.slice(-1)
        amount = amount.slice(0, -1)
      }
      const amountParts = amount.split('.')
      integralPart = amountParts[0]
      fractionalPart = amountParts[1]
    }
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
            {quantitySymbol && <span>{quantitySymbol}</span>}
          </>
        ) : (
          `${integralPart}.${fractionalPart}`
        )
      ) : (
        '-'
      )}

      {suffix && suffix !== 'ALPH' ? ` ${suffix}` : <AlefSymbol color={color} />}
    </span>
  )
}

export default styled(Amount)`
  color: ${({ color }) => color ?? 'inherit'};
`

const Decimals = styled.span`
  opacity: 0.7;
`
