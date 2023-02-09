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
import { TooltipWrapper } from 'react-tooltip'

import Button from '@/components/Button'

interface NavItemProps {
  Icon: LucideIconType
  label: string
  to?: string
  onClick?: () => void
}

const NavItem = ({ Icon, label, to, onClick }: NavItemProps) => {
  const navigate = useNavigate()
  const location = useLocation()

  const isActive = to !== undefined && location.pathname.startsWith(to)

  const handleClick = () => {
    if (to) {
      navigate(to)
    } else if (onClick) {
      onClick()
    }
  }

  return (
    <TooltipWrapper content={label} tooltipId="sidenav">
      <Button
        aria-label={label}
        onClick={handleClick}
        Icon={Icon}
        borderless={!isActive}
        squared
        role="secondary"
        transparent={!isActive}
        style={{
          cursor: isActive ? 'default' : undefined
        }}
      />
    </TooltipWrapper>
  )
}

export default NavItem
