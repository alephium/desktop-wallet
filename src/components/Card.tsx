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

import { motion } from 'framer-motion'
import styled, { css } from 'styled-components'

const Card = styled(motion.div)<{ isPlaceholder?: boolean }>`
  width: 230px;
  border: 1px ${({ isPlaceholder }) => (isPlaceholder ? 'dashed' : 'solid')} ${({ theme }) => theme.border.primary};
  border-radius: var(--radius-big);
  background-color: ${({ theme, isPlaceholder }) => (isPlaceholder ? theme.bg.secondary : theme.bg.primary)};
  box-shadow: ${({ theme }) => theme.shadow.primary};

  ${({ isPlaceholder }) =>
    !isPlaceholder &&
    css`
      cursor: pointer;
    `}
`

export default Card
