// Copyright 2018 The Alephium Authors
// This file is part of the alephium project.
//
// The library is free software: you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// The library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public License
// along with the library. If not, see <http://www.gnu.org/licenses/>.

import styled, { DefaultTheme } from 'styled-components'
import Amount from './Amount'

type BadgeType = 'plus' | 'minus' | 'neutral' | 'neutralHighlight'

interface BadgeProps {
  type: BadgeType
  content: string | number | undefined
  className?: string
  amount?: boolean
  prefix?: string
}

let Badge = ({ content, className, amount, prefix }: BadgeProps) => {
  return (
    <div className={className}>
      {prefix && <span>{prefix}</span>}
      {amount && content ? <Amount value={BigInt(content)} /> : content}
    </div>
  )
}

const getBadgeColor = (badgeType: BadgeType, theme: DefaultTheme) => {
  let backgroundColor
  let color

  switch (badgeType) {
    case 'plus':
      backgroundColor = 'rgba(48, 167, 84, 0.12)'
      color = '#37c461'
      break
    case 'minus':
      backgroundColor = 'rgba(243, 113, 93, 0.1)'
      color = 'rgba(243, 113, 93, 1)'
      break
    case 'neutral':
      backgroundColor = theme.name === 'dark' ? 'rgba(101, 16, 247, 0.28)' : 'rgba(101, 16, 247, 0.6)'
      color = theme.name === 'dark' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 1)'
      break
    case 'neutralHighlight':
      backgroundColor = 'rgba(101, 16, 247, 1)'
      color = 'rgba(255, 255, 255, 1)'
  }

  return { backgroundColor, color }
}

Badge = styled(Badge)`
  background-color: ${({ type, theme }) => getBadgeColor(type, theme).backgroundColor};
  color: ${({ type, theme }) => getBadgeColor(type, theme).color};
  text-align: center;
  padding: 5px 10px;
  border-radius: 3px;
  font-weight: 600;
  float: left;
  white-space: nowrap;
`

export default Badge
