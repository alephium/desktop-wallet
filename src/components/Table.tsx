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

export type AlignType = 'start' | 'center' | 'end'

interface TableProps {
  headers: {
    title: string
    align?: AlignType
  }[]
  minColumnWidth?: string
  className?: string
}

interface TableCellProps {
  truncate?: boolean
  align?: AlignType
}

let Table: FC<TableProps> = ({ className, children, headers, minColumnWidth = '0px' }) => (
  <div className={className}>
    <TableHeaderRow minColumnWidth={minColumnWidth}>
      {headers.map(({ title, align }) => (
        <TableHeaderCell key={title} align={align}>
          {title}
        </TableHeaderCell>
      ))}
    </TableHeaderRow>
    {children}
  </div>
)

Table = styled(Table)`
  border: 1px solid ${({ theme }) => theme.border.primary};
  border-radius: var(--radius);
  background-color: ${({ theme }) => theme.bg.secondary};
  display: table;
`

export const TableCell = styled.div<TableCellProps>`
  font-weight: var(--fontWeight-semiBold);
  ${({ truncate }) =>
    truncate &&
    css`
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    `}

  &:not(:last-child) {
    padding-right: var(--spacing-5);
  }
  ${({ align }) => align && `justify-self: ${align}`};
`

const TableHeaderCell = styled(TableCell)`
  color: ${({ theme }) => theme.font.secondary};
`

const TableColumns = styled.div<{ minColumnWidth?: string }>`
  display: grid;
  grid-auto-columns: ${({ minColumnWidth }) => `minmax(${minColumnWidth || '0px'}, 1fr)`};
  grid-auto-flow: column;

  padding: var(--spacing-3) var(--spacing-5);
  align-items: center;
`

const TableHeaderRow = styled(TableColumns)``

export const TableRow = styled(TableColumns)`
  background-color: ${({ theme }) => theme.bg.primary};

  &:last-child {
    border-bottom-left-radius: var(--radius);
    border-bottom-right-radius: var(--radius);
  }
`

export const TableFooter = styled(TableColumns)``

export default Table
