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

import { TokenInfo } from '@alephium/token-list'
import styled, { css } from 'styled-components'

import AlephiumLogoSVG from '@/images/alephium_logo_monochrome.svg'
import { ALPH } from '@/utils/constants'

interface AssetLogoProps {
  asset: Pick<TokenInfo, 'id' | 'logoURI'>
  size: number
  className?: string
}

const AssetLogo = ({ className }: AssetLogoProps) => (
  <div className={className}>
    {/* TODO: uncomment when metadata repo is accessible by the public */}
    {/* <LogoImage src={token.logoURI ?? AlephiumLogoSVG} /> */}
    <LogoImage src={AlephiumLogoSVG} />
  </div>
)

export default styled(AssetLogo)`
  display: flex;
  justify-content: center;
  align-items: center;
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  border-radius: ${({ size }) => size}px;
  padding: 5px;
  flex-shrink: 0;

  ${({ asset, theme }) =>
    asset.id === ALPH.id
      ? css`
          background: linear-gradient(218.53deg, #0075ff 9.58%, #d340f8 86.74%);
        `
      : css`
          background-color: ${theme.font.tertiary};
        `}
`

const LogoImage = styled.img`
  width: 100%;
  height: 100%;
`
