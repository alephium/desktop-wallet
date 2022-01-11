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

import { LucideProps } from 'lucide-react'
import { useHistory } from 'react-router-dom'
import styled, { useTheme } from 'styled-components'

interface ActionButtonProps {
  Icon: (props: LucideProps) => JSX.Element
  label: string
  link?: string
  onClick?: () => void
}

const ActionButton = ({ Icon, label, link, onClick }: ActionButtonProps) => {
  const theme = useTheme()
  const history = useHistory()

  const handleClick = () => {
    if (link) {
      history.push(link)
    } else if (onClick) {
      onClick()
    }
  }

  return (
    <ActionButtonContainer onClick={handleClick}>
      <ActionContent>
        <ActionIcon>
          <Icon color={theme.font.primary} size={18} />
        </ActionIcon>
        <ActionLabel>{label}</ActionLabel>
      </ActionContent>
    </ActionButtonContainer>
  )
}

const ActionLabel = styled.label`
  color: ${({ theme }) => theme.font.secondary};
  text-align: center;
  transition: all 0.1s ease-out;
`

const ActionContent = styled.div`
  flex: 1;
  display: flex;
  align-items: center;

  * {
    cursor: pointer;
  }
`

const ActionIcon = styled.div`
  display: flex;
  margin-right: var(--spacing-3);
  opacity: 0.5;
  transition: all 0.1s ease-out;
`

const ActionButtonContainer = styled.div`
  display: flex;
  align-items: stretch;
  width: 100%;
  height: 50px;

  &:not(:last-child) {
    border-bottom: 1px solid ${({ theme }) => theme.border.secondary};
  }

  &:hover {
    cursor: pointer;
    ${ActionLabel} {
      color: ${({ theme }) => theme.global.accent};
    }

    ${ActionIcon} {
      opacity: 1;
    }
  }
`

export default ActionButton
