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

import { useAppSelector } from '@/hooks/redux'

interface AmountProps {
  value?: bigint | number
  decimals?: number
  isFiat?: boolean
  fadeDecimals?: boolean
  fullPrecision?: boolean
  nbOfDecimalsToShow?: number
  color?: string
  tabIndex?: number
  suffix?: string
  isUnknownToken?: boolean
  className?: string
}

const Amount = ({
  value,
  decimals,
  isFiat,
  className,
  fadeDecimals,
  fullPrecision = false,
  color,
  nbOfDecimalsToShow,
  suffix,
  tabIndex,
  isUnknownToken
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
          : isUnknownToken
          ? value.toString()
          : formatAmountForDisplay({
              amount: value as bigint,
              amountDecimals: decimals,
              displayDecimals: nbOfDecimalsToShow,
              fullPrecision
            })
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
            {fractionalPart && <Decimals>.{fractionalPart}</Decimals>}
            {quantitySymbol && <span>{quantitySymbol}</span>}
          </>
        ) : fractionalPart ? (
          `${integralPart}.${fractionalPart}`
        ) : (
          integralPart
        )
      ) : (
        '-'
      )}

      {!isUnknownToken && <Suffix>{` ${suffix ?? 'ALPH'}`}</Suffix>}
    </span>
  )
}

export default styled(Amount)`
  color: ${({ color }) => color ?? 'inherit'};
  display: inline-flex;
  white-space: pre;
  font-weight: var(--fontWeight-bold);
`

const Decimals = styled.span`
  opacity: 0.7;
`

const Suffix = styled.span`
  color: ${({ theme }) => theme.font.secondary};
  font-weight: var(--fontWeight-medium);
`
