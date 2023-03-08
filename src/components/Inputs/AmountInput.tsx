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

import { MIN_UTXO_SET_AMOUNT, toHumanReadableAmount } from '@alephium/sdk'
import { ChangeEvent, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { useTheme } from 'styled-components'

import ActionLink from '../ActionLink'
import AlefSymbol from '../AlefSymbol'
import Amount from '../Amount'
import { InputProps } from '.'
import Input from './Input'

interface AmountInputProps extends Omit<InputProps, 'onChange'> {
  availableAmount: bigint
  onChange: (newAmount: string) => void
}

const AmountInput = ({ className, availableAmount, ...props }: AmountInputProps) => {
  const { value, onChange, ...restProps } = props
  const { t } = useTranslation()
  const [amountValue, setAmountValue] = useState(value)
  const availableAmountInAlph = toHumanReadableAmount(availableAmount)
  const minAmountInAlph = toHumanReadableAmount(MIN_UTXO_SET_AMOUNT)
  const [error, setError] = useState('')
  const theme = useTheme()

  const onAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setAmountValue(newValue)
    onChange && onChange(newValue)
  }

  const onUseMaxAmountClick = () => {
    setAmountValue(availableAmountInAlph)
    onChange && onChange(availableAmountInAlph)
  }

  useEffect(() => {
    if (!amountValue) return

    const amountValueAsFloat = parseFloat(amountValue.toString())
    setError(
      amountValueAsFloat > parseFloat(availableAmountInAlph)
        ? t`Amount exceeds available balance`
        : amountValueAsFloat < parseFloat(minAmountInAlph)
        ? t('Amount must be greater than {{ minAmountInAlph }}', { minAmountInAlph })
        : ''
    )
  }, [amountValue, availableAmountInAlph, minAmountInAlph, t])

  return (
    <div className={className}>
      <Input
        value={amountValue}
        onChange={onAmountChange}
        type="number"
        min={minAmountInAlph}
        max={availableAmountInAlph}
        aria-label={t`Amount`}
        label={
          <>
            {t`Amount`} (<AlefSymbol color={theme.font.secondary} />)
          </>
        }
        {...restProps}
        error={error}
      >
        {availableAmount && (
          <AvailableAmountRow>
            <AvailableAmount tabIndex={0}>
              {t`Available`}: <Amount value={BigInt(availableAmount)} nbOfDecimalsToShow={4} />
            </AvailableAmount>
            <ActionLinkStyled onClick={onUseMaxAmountClick}>{t`Use max amount`}</ActionLinkStyled>
          </AvailableAmountRow>
        )}
      </Input>
    </div>
  )
}

export default AmountInput

const AvailableAmount = styled.span`
  margin-right: var(--spacing-2);
  margin-left: 12px;
  font-size: 10px;
`

const AvailableAmountRow = styled.div`
  margin-top: 6px;
`

const ActionLinkStyled = styled(ActionLink)`
  font-size: 10px;
`
