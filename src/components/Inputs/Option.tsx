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

import styled, { css } from 'styled-components'

import InputArea from './InputArea'

interface OptionProps {
  isSelected: boolean
  onSelect: () => void
  className?: string
}

const Option: FC<OptionProps> = ({ className, isSelected, onSelect, children }) => (
  <InputArea onMouseDown={onSelect} className={className}>
    <Circle filled={isSelected} />
    {children}
  </InputArea>
)

export default styled(Option)`
  display: flex;
  gap: 12px;
  align-items: center;

  padding: var(--spacing-3);
  background-color: ${({ theme }) => theme.bg.primary};
  color: inherit;

  &:not(:last-child) {
    border-bottom: 1px solid ${({ theme }) => theme.border.primary};
  }

  &:hover {
    background-color: ${({ theme }) => theme.bg.secondary};
  }
`

const Circle = styled.div<{ filled: boolean }>`
  background-color: ${({ filled, theme }) => (filled ? theme.global.accent : theme.bg.secondary)};
  height: 15px;
  width: 15px;
  border-radius: var(--radius-full);
  border: 1px solid ${({ theme }) => theme.border.primary};
  display: flex;
  align-items: center;
  justify-content: center;

  &::before {
    ${({ filled }) =>
      filled &&
      css`
        content: '';
        display: block;
        height: 7px;
        width: 7px;
        background-color: var(--color-white);
        border-radius: var(--radius-full);
      `}
  }
`
