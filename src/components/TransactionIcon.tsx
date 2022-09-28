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

import { ArrowLeftRight, CircleEllipsis } from 'lucide-react'
import styled, { css } from 'styled-components'

import { useTransactionalInfoSettings } from '../hooks/useTransactionInfoSettings'
import arrowDownSvg from '../images/arrow_down.svg'
import { TransactionInfoType } from '../utils/transactions'

interface TransactionIconProps {
  type: TransactionInfoType
}

const TransactionIcon = ({ type }: TransactionIconProps) => {
  const { label, iconColor, iconBgColor } = useTransactionalInfoSettings()

  const icon = {
    in: <Arrow type={type} color={iconColor[type]} />,
    out: <Arrow type={type} color={iconColor[type]} />,
    pending: <CircleEllipsis size={16} color={iconColor[type]} />,
    move: <ArrowLeftRight size={16} color={iconColor[type]} />
  }[type]

  return (
    <Circle color={iconBgColor[type]} aria-label={label[type]}>
      {icon}
    </Circle>
  )
}

export default TransactionIcon

const Circle = styled.span<{ color?: string }>`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 25px;
  height: 25px;
  border-radius: 39px;
  background-color: ${({ color, theme }) => color || theme.font.primary};
`

const Arrow = styled.span<{ color?: string } & TransactionIconProps>`
  display: inline-block;
  width: 16px;
  height: 15px;
  -webkit-mask: url(${arrowDownSvg}) no-repeat 100% 100%;
  mask: url(${arrowDownSvg}) no-repeat 100% 100%;
  -webkit-mask-size: cover;
  mask-size: cover;
  background-color: ${({ color, theme }) => color || theme.font.primary};
  position: relative;

  ${({ type }) =>
    type === 'out'
      ? css`
          transform: rotate(180deg);
          top: -1px;
        `
      : css`
          top: 1px;
        `}
`
