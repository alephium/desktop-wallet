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

import styled, { useTheme } from 'styled-components'

import Amount from './Amount'

interface TransactionalInfoProps {
  type: 'out' | 'in' | 'pending'
  content: string | bigint
  amount?: boolean
  prefix?: string
  className?: string
}

const TransactionalInfo = ({ content, className, amount, prefix, type }: TransactionalInfoProps) => {
  const theme = useTheme()
  const color = type === 'out' || type === 'pending' ? theme.font.secondary : theme.global.valid

  return (
    <div className={className} color={color}>
      {prefix && <span>{prefix}</span>}
      {amount && content ? <Amount value={BigInt(content)} fadeDecimals color={color} /> : content}
    </div>
  )
}

export default styled(TransactionalInfo)`
  color: ${({ type, theme }) => (type === 'out' || type === 'pending' ? theme.font.secondary : theme.global.valid)};
  text-align: center;
  border-radius: 3px;
  font-weight: var(--fontWeight-semiBold);
  float: left;
  white-space: nowrap;
`
