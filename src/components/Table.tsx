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

import classNames from 'classnames'
import { FC } from 'react'
import styled, { css } from 'styled-components'

type AlignType = 'start' | 'center' | 'end'

export interface TableProps {
  headers?: {
    title: string
    align?: AlignType
    width?: string
  }[]
  className?: string
  isLoading?: boolean
  minWidth?: string
}

interface TableCellProps {
  truncate?: boolean
  align?: AlignType
}

const Table: FC<TableProps> = ({ className, children, headers, isLoading }) => (
  <ScrollableWrapper>
    <div className={classNames(className, { 'skeleton-loader': isLoading })}>
      {headers && headers.length > 0 && (
        <TableHeaderRow columnWidths={headers.map(({ width }) => width)}>
          {headers.map(({ title, align }) => (
            <TableHeaderCell key={title} align={align}>
              {title}
            </TableHeaderCell>
          ))}
        </TableHeaderRow>
      )}
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

  ${({ isLoading }) =>
    isLoading &&
    css`
      min-height: 300px;
      width: 100%;
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
  ${({ align }) => align && `justify-self: ${align}`};
`

const TableHeaderCell = styled(TableCell)`
  color: ${({ theme }) => theme.font.secondary};
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
  padding: 17.5px 20px;
`

const TableHeaderRow = styled(TableColumns)`
  background-color: ${({ theme }) => theme.bg.tertiary};
  border-top-left-radius: var(--radius);
  border-top-right-radius: var(--radius);
`

export const TableRow = styled(TableColumns)<{ onClick?: () => void; blinking?: boolean }>`
  border-bottom: 1px solid ${({ theme }) => theme.border.primary};

  &:last-child {
    border-bottom: none;
    border-bottom-left-radius: var(--radius);
    border-bottom-right-radius: var(--radius);
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
  box-shadow: ${({ theme }) => theme.shadow.primary};
`
