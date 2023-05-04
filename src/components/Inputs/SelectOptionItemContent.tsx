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

import { ReactNode } from 'react'
import styled from 'styled-components'

interface SelectOptionItemContentProps {
  MainContent: ReactNode
  SecondaryContent?: ReactNode
  className?: string
  displaysCheckMarkWhenSelected?: boolean
}

const SelectOptionItemContent = ({
  MainContent: ContentLeft,
  SecondaryContent: ContentRight,
  className
}: SelectOptionItemContentProps) => (
  <div className={className}>
    <OptionMainContent>{ContentLeft}</OptionMainContent>
    <OptionSecondaryContent>{ContentRight}</OptionSecondaryContent>
  </div>
)

export default styled(SelectOptionItemContent)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  width: ${({ displaysCheckMarkWhenSelected }) => (displaysCheckMarkWhenSelected ? 90 : 100)}%;
`

const OptionMainContent = styled.div`
  font-weight: var(--fontWeight-semiBold);
`

const OptionSecondaryContent = styled.div`
  * {
    color: ${({ theme }) => theme.font.secondary} !important;
  }
`
