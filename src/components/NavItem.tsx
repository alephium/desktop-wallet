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

interface NavItemProps {
  Icon: LucideIconType
  label: string
  link?: string
  onClick?: () => void
  className?: string
}

const NavItem = ({ Icon, label, link, onClick, className }: NavItemProps) => {
  const theme = useTheme()
  const navigate = useNavigate()
  const location = useLocation()

  const isActive = link !== undefined && location.pathname.startsWith(link)

  const handleClick = () => {
    if (link) {
      navigate(link)
    } else if (onClick) {
      onClick()
    }
  }

  return (
    <NavItemContainer className={className} aria-label={label} onClick={handleClick} isActive={isActive}>
      <Icon color={theme.font.primary} size={18} />
    </NavItemContainer>
  )
}

export default NavItem

const NavItemContainer = styled.button<{ isActive: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: 1px solid transparent;
  border-radius: var(--radius-medium);
  background-color: transparent;
  opacity: 0.5;
  transition: all 0.1s ease-out;
  cursor: pointer;

  ${({ isActive }) =>
    isActive &&
    css`
      background-color: ${({ theme }) => theme.bg.primary};
      border-color: ${({ theme }) => theme.border.primary};
      box-shadow: ${({ theme }) => theme.shadow.primary};
      opacity: 1;
    `}

  &:hover {
    opacity: 1;
  }
`
