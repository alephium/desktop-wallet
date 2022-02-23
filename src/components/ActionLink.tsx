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

import { FC } from 'react'
import styled from 'styled-components'
import tinycolor from 'tinycolor2'

interface ActionLinkProps {
  className?: string
  onClick: () => void
}

let ActionLink: FC<ActionLinkProps> = ({ className, children, onClick }) => {
  return (
    <a className={className} onClick={onClick}>
      {children}
    </a>
  )
}

ActionLink = styled(ActionLink)`
  color: ${({ theme }) => theme.global.accent};
  cursor: pointer;
  display: inline-flex;
  align-items: center;

  &:hover {
    color: ${({ theme }) => tinycolor(theme.global.accent).darken(10).toString()};
  }
`

export default ActionLink
