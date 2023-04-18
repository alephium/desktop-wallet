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

import styled, { css } from 'styled-components'

type AlignType = 'start' | 'center' | 'end'

export interface TableProps {
  minWidth?: string
  className?: string
}

interface TableCellProps {
  truncate?: boolean
  align?: AlignType
}

const Table: FC<TableProps> = ({ className, children }) => (
  <ScrollableWrapper className={className}>
    <div role="table" tabIndex={0}>
      {children}
    </div>
  </ScrollableWrapper>
)

export default styled(Table)`
  background-color: ${({ theme }) => theme.bg.primary};

  ${({ minWidth }) =>
    minWidth &&
    css`
      min-width: ${minWidth};
    `}
`

export const TableCell = styled.div<TableCellProps>`
  display: inline-flex;
  font-weight: var(--fontWeight-semiBold);
  position: relative;
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
  ${({ align }) =>
    align &&
    css`
      justify-self: ${align};
      text-align: ${align === 'end' ? 'right' : 'auto'};
    `};
`

const TableColumns = styled.div<{ columnWidths?: (string | undefined)[] }>`
  display: grid;
  ${({ columnWidths }) =>
    columnWidths
      ? css`
          grid-template-columns: ${columnWidths.map((columnWidth) => `minmax(${columnWidth || '0px'}, 1fr)`).join(' ')};
        `
      : css`
          grid-auto-columns: minmax(0px, 1fr);
          grid-auto-flow: column;
        `};

  align-items: center;
  padding: 18px 20px;
  min-height: 52px;
`

export const TableRow = styled(TableColumns)<{ onClick?: () => void; blinking?: boolean }>`
  border-bottom: 1px solid ${({ theme }) => theme.border.primary};
  transition: background-color 0.2s ease-out;

  &:last-child {
    border-bottom: none;
    border-bottom-left-radius: var(--radius-small);
    border-bottom-right-radius: var(--radius-small);
  }

  ${({ onClick }) =>
    onClick &&
    css`
      &:hover {
        cursor: pointer;
        background-color: ${({ theme }) => theme.bg.hover};
      }
    `}

  ${({ blinking }) =>
    blinking &&
    css`
      opacity: 0.5;

      background: linear-gradient(90deg, rgba(200, 200, 200, 0.4), rgba(200, 200, 200, 0.05));
      background-size: 400% 400%;
      animation: gradient 2s ease infinite;

      @keyframes gradient {
        0% {
          background-position: 0% 50%;
        }
        25% {
          background-position: 100% 50%;
        }
        75% {
          background-position: 25% 50%;
        }
        100% {
          background-position: 0% 50%;
        }
      }
    `}
`

export const TableFooter = styled(TableColumns)``

export const TableCellPlaceholder = styled(TableCell)`
  color: ${({ theme }) => theme.font.secondary};
`

const ScrollableWrapper = styled.div`
  width: 100%;
  overflow: auto;
  border-radius: var(--radius-big);
  border: 1px solid ${({ theme }) => theme.border.primary};
`

export const TableHeader: FC<{ title: string; className?: string }> = ({ title, children, className }) => (
  <TableHeaderRow className={className}>
    <TableTitle>{title}</TableTitle>
    {children}
  </TableHeaderRow>
)

const TableHeaderRow = styled(TableRow)`
  display: flex;
  justify-content: space-between;
  height: 60px;
  background-color: ${({ theme }) => theme.bg.secondary};
`

const TableTitle = styled.div`
  font-size: 15px;
  font-weight: var(--fontWeight-semiBold);
`
