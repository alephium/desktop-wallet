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

import Badge from './Badge'

const TransactionBadge = styled(Badge)`
  background-color: ${({ theme }) => theme.bg.secondary};
  padding: 3px 10px;
  border-radius: var(--radius-small);
  min-width: 50px;
  display: inline-flex;
  justify-content: center;
  margin-right: var(--spacing-4);
  float: none;
`

export default TransactionBadge
