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

import { useLocation, useNavigate } from 'react-router-dom'
import styled, { css, useTheme } from 'styled-components'

import InputArea from './Inputs/InputArea'

interface ActionButtonProps {
  Icon: LucideIconType
  label: string
  link?: string
  onClick?: () => void
}

const ActionButton = ({ Icon, label, link, onClick }: ActionButtonProps) => {
  const theme = useTheme()
  const navigate = useNavigate()
  const location = useLocation()

  const handleInput = () => {
    if (link) {
      navigate(link)
    } else if (onClick) {
      onClick()
    }
  }

  return (
    <ActionButtonContainer
      aria-label={label}
      onInput={handleInput}
      isActive={link !== undefined && location.pathname.startsWith(link)}
    >
      <ActionContent>
        <ActionIcon>
          <Icon color={theme.font.primary} size={18} />
        </ActionIcon>
        <ActionLabel>{label}</ActionLabel>
      </ActionContent>
    </ActionButtonContainer>
  )
}

export default ActionButton

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

const ActionButtonContainer = styled(InputArea)<{ isActive: boolean }>`
  display: flex;
  align-items: stretch;
  width: 100%;
  height: 50px;

  &:hover {
    ${ActionLabel} {
      color: ${({ theme }) => theme.global.accent};
    }

    ${ActionIcon} {
      opacity: 1;
    }
  }

  ${({ isActive }) =>
    isActive &&
    css`
      ${ActionLabel} {
        color: ${({ theme }) => theme.font.primary};
      }

      ${ActionIcon} {
        opacity: 1;
      }
    `}
`
