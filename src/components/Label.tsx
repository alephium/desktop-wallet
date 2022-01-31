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

import { FC } from 'react'
import styled from 'styled-components'
import tinycolor from 'tinycolor2'

interface LabelProps {
  className?: string
  color?: string
}

let Label: FC<LabelProps> = ({ className, children }) => {
  return <span className={className}>{children}</span>
}

Label = styled(Label)`
  padding: 3px 6px;
  color: ${({ color, theme }) => color || theme.font.primary}};
  border: 1px solid ${({ color, theme }) => color || theme.font.primary}};
  border-radius: var(--radius-small);
  background-color: ${({ color, theme }) =>
    tinycolor(color || theme.font.primary)
      .setAlpha(0.2)
      .toString()}};
`

export default Label
