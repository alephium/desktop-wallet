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

import { AssetInfo } from '@alephium/sdk'
import { ALPH } from '@alephium/token-list'
import { HelpCircle } from 'lucide-react'
import styled, { css } from 'styled-components'

import AlephiumLogoSVG from '@/images/alephium_logo_monochrome.svg'
import { NFT } from '@/types/assets'

interface AssetLogoProps {
  assetId: AssetInfo['id']
  assetImageUrl: AssetInfo['logoURI'] | NFT['image']
  size: number
  assetName?: AssetInfo['name']
  className?: string
}

const AssetLogo = ({ assetId, assetImageUrl, size, assetName, className }: AssetLogoProps) => (
  <div className={className}>
    {assetImageUrl ? (
      <LogoImage src={assetImageUrl} />
    ) : assetId === ALPH.id ? (
      <LogoImage src={AlephiumLogoSVG} />
    ) : assetName ? (
      <Initials size={size}>{assetName.slice(0, 2)}</Initials>
    ) : (
      <HelpCircle size={size} />
    )}
  </div>
)

export default styled(AssetLogo)`
  display: flex;
  justify-content: center;
  align-items: center;
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  border-radius: ${({ size }) => size}px;
  flex-shrink: 0;
  overflow: hidden;

  ${({ assetId, assetImageUrl, theme }) =>
    assetId === ALPH.id
      ? css`
          padding: 5px;
          background: linear-gradient(218.53deg, #0075ff 9.58%, #d340f8 86.74%);
        `
      : !assetImageUrl &&
        css`
          background: ${theme.bg.tertiary};
        `}
`

const LogoImage = styled.img`
  width: 100%;
  height: 100%;
`

const Initials = styled.span<{ size: number }>`
  font-size: ${({ size }) => size * 0.45}px;
  text-transform: uppercase;
`
