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

import { colord } from 'colord'
import styled, { css } from 'styled-components'

import { HasTooltip } from '@/components/Tooltip'
import Truncate from '@/components/Truncate'

interface BadgeProps {
  color?: string
  border?: boolean
  transparent?: boolean
  truncate?: boolean
  rounded?: boolean
  className?: string
}

const Badge: FC<HasTooltip<BadgeProps>> = ({ className, children, truncate, tooltip }) => (
  <div className={className} data-tooltip-id="default" data-tooltip-content={tooltip}>
    {truncate ? <Truncate>{children}</Truncate> : <span>{children}</span>}
  </div>
)

export default styled(Badge)`
  ${({ color, theme, rounded, border, truncate, transparent }) => {
    const usedColor = color || theme.font.primary

    return css`
      display: inline-flex;
      align-items: center;
      padding: 0 12px 0 15px;
      height: 35px;
      color: ${usedColor};
      border-radius: ${rounded ? '50px' : 'var(--radius-big)'};
      background-color: ${!transparent && colord(usedColor).alpha(0.05).toRgbString()};
      ${border &&
      css`
        border: 1px solid ${theme.border.primary};
      `};
      ${truncate &&
      css`
        max-width: 100%;
        display: inline-block;
      `}
    `
  }}
`
