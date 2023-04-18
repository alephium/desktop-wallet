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

import { ReactNode } from 'react'
import styled from 'styled-components'

interface OptionItemContentProps {
  MainContent: ReactNode
  SecondaryContent?: ReactNode
  className?: string
}

const OptionItemContent = ({
  MainContent: ContentLeft,
  SecondaryContent: ContentRight,
  className
}: OptionItemContentProps) => (
  <div className={className}>
    <OptionMainContent>{ContentLeft}</OptionMainContent>
    <OptionSecondaryContent>{ContentRight}</OptionSecondaryContent>
  </div>
)

export default styled(OptionItemContent)`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
`

const OptionMainContent = styled.div`
  font-weight: var(--fontWeight-semiBold);
  max-width: 200px;
`

const OptionSecondaryContent = styled.div`
  max-width: 200px;
  * {
    color: ${({ theme }) => theme.font.secondary} !important;
  }
`
