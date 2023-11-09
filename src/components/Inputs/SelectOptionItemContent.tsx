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

import CheckMark from '@/components/CheckMark'

interface SelectOptionItemContentProps {
  MainContent: ReactNode
  isSelected: boolean
  SecondaryContent?: ReactNode
  className?: string
  displaysCheckMarkWhenSelected?: boolean
}

const SelectOptionItemContent = ({
  MainContent: ContentTop,
  SecondaryContent: ContentBottom,
  isSelected,
  className
}: SelectOptionItemContentProps) => (
  <div className={className}>
    <OptionMainContent>
      {ContentTop}
      {isSelected && (
        <CheckMarkContainer>
          <CheckMark />
        </CheckMarkContainer>
      )}
    </OptionMainContent>
    <OptionSecondaryContent>{ContentBottom}</OptionSecondaryContent>
  </div>
)

export default styled(SelectOptionItemContent)`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  &:hover {
    > div {
      background-color: ${({ theme }) => theme.bg.hover};
    }
  }
`

const OptionMainContent = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  font-weight: var(--fontWeight-semiBold);
  border-bottom: 1px solid ${({ theme }) => theme.border.secondary};
  background-color: ${({ theme }) => theme.bg.primary};
  padding: var(--spacing-3);
`

const OptionSecondaryContent = styled.div`
  background-color: ${({ theme }) => theme.bg.secondary};
  padding: var(--spacing-3);
`

const CheckMarkContainer = styled.div`
  margin-left: var(--spacing-3);
`
