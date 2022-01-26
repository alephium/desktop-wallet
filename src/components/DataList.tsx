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

import styled from 'styled-components'

const DataList = styled.div`
  border: 1px solid ${({ theme }) => theme.border.primary};
  border-radius: var(--radius);
`

export const DataListRow = styled.div`
  display: grid;
  grid-auto-columns: 1fr;
  grid-auto-flow: column;

  &:not(:last-child) {
    border-bottom: 1px solid ${({ theme }) => theme.border.primary};
  }
`

export const DataListCell = styled.div`
  padding: var(--spacing-4);
`

export default DataList
