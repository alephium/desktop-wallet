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

import styled from 'styled-components'

import Amount from '@/components/Amount'
import AssetLogo from '@/components/AssetLogo'
import HashEllipsed from '@/components/HashEllipsed'
import SelectOptionItemContent from '@/components/Inputs/SelectOptionItemContent'
import { Asset } from '@/types/assets'

interface SelectOptionAssetProps {
  asset: Asset
  hideAmount?: boolean
  className?: string
}

const SelectOptionAsset = ({ asset, hideAmount, className }: SelectOptionAssetProps) => (
  <SelectOptionItemContent
    className={className}
    MainContent={
      <AssetName>
        <AssetLogo asset={asset} size={20} />
        {asset.name && asset.symbol ? `${asset.name} (${asset.symbol})` : <HashEllipsed hash={asset.id} />}
      </AssetName>
    }
    SecondaryContent={
      !hideAmount && (
        <AmountStyled
          value={asset.balance}
          suffix={asset.symbol}
          decimals={asset.decimals}
          isUnknownToken={!asset.symbol}
        />
      )
    }
  />
)

export default SelectOptionAsset

const AssetName = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  max-width: 200px;
`

const AmountStyled = styled(Amount)`
  flex: 1;
  font-weight: var(--fontWeight-semiBold);
`
