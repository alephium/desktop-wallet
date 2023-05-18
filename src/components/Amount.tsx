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

import { convertToPositive, formatAmountForDisplay, formatFiatAmountForDisplay } from '@alephium/sdk'
import { useTranslation } from 'react-i18next'
import styled, { css } from 'styled-components'

import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { discreetModeToggled } from '@/storage/settings/settingsActions'

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
  highlight,
  isUnknownToken,
  showPlusMinus = false
}: AmountProps) => {
  const dispatch = useAppDispatch()
  const discreetMode = useAppSelector((state) => state.settings.discreetMode)
  const { t } = useTranslation()

  let quantitySymbol = ''
  let amount = ''
  let isNegative = false

  if (value !== undefined) {
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
    <AmountStyled
      {...{ className, color, value, highlight, tabIndex: tabIndex ?? -1, discreetMode }}
      data-tooltip-id="default"
      data-tooltip-content={discreetMode ? t('Click to deactivate discreet mode') : ''}
      data-tooltip-delay-show={500}
      onClick={() => discreetMode && dispatch(discreetModeToggled())}
    >
      {value !== undefined ? (
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
    </AmountStyled>
  )
}

export default Amount

const AmountStyled = styled.div<Pick<AmountProps, 'color' | 'highlight' | 'value'> & { discreetMode: boolean }>`
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
  font-weight: var(--fontWeight-bold);
  font-feature-settings: 'tnum' on;
  ${({ discreetMode }) =>
    discreetMode &&
    css`
      filter: blur(10px);
      max-width: 100px;
      overflow: hidden;
      cursor: pointer;
    `}
`

const Decimals = styled.span`
  opacity: 0.7;
`

const Suffix = styled.span<{ color?: string }>`
  color: ${({ color, theme }) => color ?? theme.font.secondary};
  font-weight: var(--fontWeight-medium);
`
