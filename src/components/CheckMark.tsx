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

import { Check } from 'lucide-react'
import styled from 'styled-components'

interface CheckMarkProps {
  className?: string
}

const CheckMark = ({ className }: CheckMarkProps) => (
  <div className={className}>
    <Check strokeWidth={4} />
  </div>
)

export default styled(CheckMark)`
  height: 16px;
  width: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.global.accent};
  color: var(--color-white);
  border-radius: 40px;
  padding: 3px;
`
