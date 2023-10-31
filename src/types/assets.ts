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

import { Asset, AssetAmount } from '@alephium/sdk'
import { FungibleTokenMetaData, NFTMetaData } from '@alephium/web3'

export type AssetAmountInputType = AssetAmount & { amountInput?: string }

export type FungibleTokenBasicMetadata = Omit<FungibleTokenMetaData, 'totalSupply'> & { id: Asset['id'] }

export type NFT = {
  id: Asset['id']
  collectionId: NFTMetaData['collectionId']
  name?: string
  description?: string
  image?: string
}

export type SyncUnknownTokensInfoResult = {
  tokens: FungibleTokenBasicMetadata[]
  nfts: NFT[]
}
