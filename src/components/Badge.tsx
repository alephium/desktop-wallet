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

import styled, { DefaultTheme } from 'styled-components'

import Amount from './Amount'

interface BadgeProps {
  type: keyof DefaultTheme['badge']['font']
  content: string | number | undefined
  className?: string
  amount?: boolean
  prefix?: string
}

const Badge = ({ content, className, amount, prefix }: BadgeProps) => (
  <div className={className}>
    {prefix && <span>{prefix}</span>}
    {amount && content ? <Amount value={BigInt(content)} fadeDecimals /> : content}
  </div>
)

export default styled(Badge)`
  color: ${({ type, theme }) => theme.badge.font[type]};
  text-align: center;
  border-radius: 3px;
  font-weight: var(--fontWeight-semiBold);
  float: left;
  white-space: nowrap;
`
