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

import { AddressBalance, Token } from '@alephium/sdk/api/explorer'
import { TokenInfo } from '@alephium/token-list'

import { PartialBy } from '@/types/generics'

// Used in Redux, amounts need to be in string format
export type TokenBalances = AddressBalance & { id: Token['id'] }

// Same as TokenBalances, but amounts are in BigInt, useful for display purposes
export type TokenDisplayBalances = Omit<TokenBalances, 'balance' | 'lockedBalance'> & {
  balance: bigint
  lockedBalance: bigint
}

export type Asset = TokenDisplayBalances & PartialBy<TokenInfo, 'symbol' | 'name'>

export type AssetAmount = { id: Asset['id']; amount?: bigint }

export type AssetAmountInputType = AssetAmount & { amountInput?: string }

export type TransactionInfoAsset = PartialBy<Omit<Asset, 'balance' | 'lockedBalance'>, 'decimals'> &
  Required<AssetAmount>
