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

import { abbreviateAmount } from 'alephium-js/dist/lib/numbers'
import styled from 'styled-components'

import { useGlobalContext } from '../contexts/global'

interface AmountProps {
  value: bigint | undefined
  className?: string
}

const Amount = ({ value, className }: AmountProps) => {
  const {
    settings: {
      general: { discreetMode }
    }
  } = useGlobalContext()
  let integralPart = ''
  let fractionalPart = ''

  if (!discreetMode && value !== undefined) {
    const abbreviatedAmountParts = abbreviateAmount(value).split('.')
    integralPart = abbreviatedAmountParts[0]
    fractionalPart = abbreviatedAmountParts[1]
  }

  return (
    <span className={className}>
      {discreetMode ? (
        '•••'
      ) : value !== undefined ? (
        <>
          <span>{integralPart}</span>
          <Decimals>.{fractionalPart}</Decimals>
        </>
      ) : (
        '-'
      )}
      {' ℵ'}
    </span>
  )
}

const Decimals = styled.span`
  /* font-size: 0.85em; */
`

export default Amount
