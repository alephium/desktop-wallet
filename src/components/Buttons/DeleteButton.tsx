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

import { X } from 'lucide-react'
import styled from 'styled-components'

import Button, { ButtonProps } from '@/components/Button'

const DeleteButton = (props: ButtonProps) => <Button Icon={X} role="secondary" {...props} />

export default styled(DeleteButton)`
  position: absolute;
  top: -20px;
  right: -10px;
  opacity: 0;
  height: 30px;
  width: 30px;
  padding: 0;
  min-width: 30px;
  border-radius: var(--radius-full);
`
