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

import { colord } from 'colord'
import styled from 'styled-components'

import Button, { ButtonProps } from '@/components/Button'

const FooterButton: FC<ButtonProps> = ({ children, ...props }) => (
  <ModalFooter>
    <Button tall {...props}>
      {children}
    </Button>
  </ModalFooter>
)

export default FooterButton

const ModalFooter = styled.div`
  position: sticky;
  bottom: 0;
  background-color: ${({ theme }) => colord(theme.bg.background1).alpha(0.5).toHex()};
  backdrop-filter: blur(10px);
  display: flex;
  justify-content: center;
  margin-top: var(--spacing-6);
  margin: var(--spacing-6) calc(-1 * var(--spacing-4)) 0;
`
