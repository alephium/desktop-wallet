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

import styled from 'styled-components'

export default styled.div`
  background-color: ${({ theme }) => theme.global.accent};
  color: var(--color-white);
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1001;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
`
