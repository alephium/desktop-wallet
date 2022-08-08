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

import styled from 'styled-components'

import { TransactionDirection } from '../contexts/addresses'
import arrowDownSvg from '../images/arrow_down.svg'

interface Props {
  direction: TransactionDirection
}

const DirectionalArrow = ({ direction }: Props) => {
  const color = {
    circle: direction === 'in' ? 'rgba(108, 217, 158, 0.11)' : 'rgba(153, 153, 153, 0.11)',
    arrow: direction === 'in' ? 'rgba(62, 210, 130, 1)' : 'rgba(153, 153, 153, 1)'
  }
  return (
    <Circle color={color.circle}>
      <Arrow direction={direction} color={color.arrow} />
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

const Arrow = styled.span<{ color?: string } & Props>`
  display: inline-block;
  font-size: 1.2em;
  width: 1em;
  height: 1em;
  -webkit-mask: url(${arrowDownSvg}) no-repeat 100% 100%;
  mask: url(${arrowDownSvg}) no-repeat 100% 100%;
  -webkit-mask-size: cover;
  mask-size: cover;
  background-color: ${({ color, theme }) => color || theme.font.primary};
  ${({ direction }) => direction === 'out' && 'transform: rotate(180deg);'}
`
