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
import { convertToPositive } from '@/utils/misc'

interface AmountProps {
  value?: bigint | number
  decimals?: number
  isFiat?: boolean
  fadeDecimals?: boolean
  fullPrecision?: boolean
  nbOfDecimalsToShow?: number
  color?: string
  overrideSuffixColor?: boolean
  tabIndex?: number
  suffix?: string
  isUnknownToken?: boolean
  highlight?: boolean
  showPlusMinus?: boolean
  className?: string
}

const Amount = ({
  value,
  decimals,
  isFiat,
  className,
  fadeDecimals,
  fullPrecision = false,
  nbOfDecimalsToShow,
  suffix,
  color,
  overrideSuffixColor,
  tabIndex,
  isUnknownToken,
  showPlusMinus = false
}: AmountProps) => {
  const { discreetMode } = useAppSelector((state) => state.settings)

  let quantitySymbol = ''
  let amount = ''
  let isNegative = false

  if (!discreetMode && value !== undefined) {
    if (isFiat && typeof value === 'number') {
      amount = formatFiatAmountForDisplay(value)
    } else if (isUnknownToken) {
      amount = value.toString()
    } else {
      isNegative = value < 0
      amount = formatAmountForDisplay({
        amount: convertToPositive(value as bigint),
        amountDecimals: decimals,
        displayDecimals: nbOfDecimalsToShow,
        fullPrecision
      })
    }

    if (fadeDecimals && ['K', 'M', 'B', 'T'].some((char) => amount.endsWith(char))) {
      quantitySymbol = amount.slice(-1)
      amount = amount.slice(0, -1)
    }
  }

  const [integralPart, fractionalPart] = amount.split('.')

  return (
    <span className={className} tabIndex={tabIndex ?? -1}>
      {discreetMode ? (
        '•••'
      ) : value !== undefined ? (
        <>
          {showPlusMinus && <span>{isNegative ? '-' : '+'}</span>}
          {fadeDecimals ? (
            <>
              <span>{integralPart}</span>
              {fractionalPart && <Decimals>.{fractionalPart}</Decimals>}
              {quantitySymbol && <span>{quantitySymbol}</span>}
            </>
          ) : fractionalPart ? (
            `${integralPart}.${fractionalPart}`
          ) : (
            integralPart
          )}
        </>
      ) : (
        '-'
      )}

      {!isUnknownToken && <Suffix color={overrideSuffixColor ? color : undefined}>{` ${suffix ?? 'ALPH'}`}</Suffix>}
    </span>
  )
}

export default styled(Amount)`
  color: ${({ color, highlight, value, theme }) =>
    color
      ? color
      : highlight && value !== undefined
      ? value < 0
        ? theme.font.highlight
        : theme.global.valid
      : 'inherit'};
  display: inline-flex;
  white-space: pre;
  font-weight: var(--fontWeight-semiBold);
`

const Decimals = styled.span`
  opacity: 0.7;
`

const Suffix = styled.span<{ color?: string }>`
  color: ${({ color, theme }) => color ?? theme.font.secondary};
  font-weight: var(--fontWeight-medium);
`
