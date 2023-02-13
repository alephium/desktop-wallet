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

import styled, { css } from 'styled-components'

import dotSvg from '@/images/dot.svg'

interface DotIconProps {
  color: string
  size?: 'normal' | 'big'
}

export default styled.div<DotIconProps>`
  display: inline-block;

  -webkit-mask: url(${dotSvg}) no-repeat 100% 100%;
  mask: url(${dotSvg}) no-repeat 100% 100%;
  -webkit-mask-size: cover;
  mask-size: cover;
  background-color: ${({ color, theme }) => color || theme.font.primary};
  flex-shrink: 0;

  ${({ size }) =>
    size === 'big'
      ? css`
          width: 10px;
          height: 11px;
        `
      : css`
          width: 7px;
          height: 8px;
        `}
`
