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

import { ReactComponent as DotSvg } from '@/images/dot.svg'

interface DotIconProps {
  color: string
  size?: number
  strokeColor?: string
  className?: string
}

const defaultSize = 8

const DotIcon = ({ className }: DotIconProps) => <DotSvg className={className} />

export default styled(DotIcon)`
  fill: ${({ color }) => color};
  width: ${({ size }) => size ?? defaultSize}px;
  height: ${({ size }) => size ?? defaultSize}px;
  stroke: ${({ strokeColor }) => strokeColor};
  transition: all 0.3s ease-out;
`
