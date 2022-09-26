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

import { colord } from 'colord'
import { RefreshCcw } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import styled, { css, useTheme } from 'styled-components'

import arrowDownSvg from '../images/arrow_down.svg'
import { TransactionDirection } from '../utils/transactions'

interface DirectionalArrowProps {
  direction: TransactionDirection
  isMoved?: boolean
}

const DirectionalArrow = ({ isMoved, direction }: DirectionalArrowProps) => {
  const theme = useTheme()
  const { t } = useTranslation('App')

  let _direction = direction

  if (isMoved) {
    _direction = 'move'
  }

  const color = {
    circle: {
      in: colord(theme.global.valid).alpha(0.11).toRgbString(),
      out: colord(theme.global.accent).alpha(0.11).toRgbString(),
      pending: '',
      move: colord(theme.font.secondary).alpha(0.11).toRgbString()
    },
    arrow: {
      in: theme.global.valid,
      out: theme.global.accent,
      pending: '',
      move: ''
    },
    cyclic: {
      in: '',
      out: '',
      pending: '',
      move: colord(theme.font.primary).darken(0.2).toRgbString()
    }
  }

  const ariaLabel = { pending: t`Pending`, in: t`Received`, out: t`Sent`, move: t`Moved` }[_direction]
  const icon = {
    in: <Arrow direction={_direction} color={color.arrow[_direction]} />,
    out: <Arrow direction={_direction} color={color.arrow[_direction]} />,
    pending: null,
    move: <RefreshCcw size={16} color={color.cyclic[_direction]} />
  }[_direction]

  return (
    <Circle color={color.circle[_direction]} aria-label={ariaLabel}>
      {icon}
    </Circle>
  )
}

export default DirectionalArrow

const Circle = styled.span<{ color?: string }>`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 25px;
  height: 25px;
  border-radius: 39px;
  background-color: ${({ color, theme }) => color || theme.font.primary};
`

const Arrow = styled.span<{ color?: string } & DirectionalArrowProps>`
  display: inline-block;
  width: 16px;
  height: 15px;
  -webkit-mask: url(${arrowDownSvg}) no-repeat 100% 100%;
  mask: url(${arrowDownSvg}) no-repeat 100% 100%;
  -webkit-mask-size: cover;
  mask-size: cover;
  background-color: ${({ color, theme }) => color || theme.font.primary};
  position: relative;

  ${({ direction }) =>
    direction === 'out'
      ? css`
          transform: rotate(180deg);
          top: -1px;
        `
      : css`
          top: 1px;
        `}
`
