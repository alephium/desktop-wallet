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
import styled, { css } from 'styled-components'
import tinycolor from 'tinycolor2'

import Truncate from './Truncate'

interface BadgeProps {
  className?: string
  color?: string
  border?: boolean
  truncate?: boolean
  rounded?: boolean
}

const Badge: FC<BadgeProps> = ({ className, children, truncate }) => {
  return truncate ? (
    <Truncate className={className}>{children}</Truncate>
  ) : (
    <span className={className}>{children}</span>
  )
}

export default styled(Badge)`
  ${({ color, theme, rounded, border, truncate }) => {
    const usedColor = color || theme.font.primary

    return css`
      display: inline;
      padding: 5px 10px;
      color: ${usedColor};
      border-radius: ${rounded ? '20px' : 'var(--radius-small)'};
      background-color: ${tinycolor(usedColor).setAlpha(0.08).toString()};
      ${border &&
      css`
        border: 1px solid ${tinycolor(usedColor).setAlpha(0.2).toString()};
      `};
      ${truncate &&
      css`
        max-width: 100%;
        display: inline-block;
      `}
    `
  }}
`
