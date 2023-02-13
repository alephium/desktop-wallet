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

import { NUM_OF_ZEROS_IN_QUINTILLION, produceZeros } from '@alephium/sdk'
import TokensMetadata, { TokenInfo } from '@alephium/tokens-list'
import { createAsyncThunk, createEntityAdapter, createSelector, createSlice, EntityState } from '@reduxjs/toolkit'

import { selectAllAddresses } from '@/storage/app-state/slices/addressesSlice'
import { customNetworkSettingsSaved, networkPresetSwitched } from '@/storage/app-state/slices/networkSlice'
import { RootState } from '@/storage/app-state/store'
import { TokenDisplay, TokenDisplayBalances } from '@/types/tokens'

const sliceName = 'tokens'

interface TokensState extends EntityState<TokenInfo> {
  status: 'initialized' | 'uninitialized'
}

const tokensAdapter = createEntityAdapter<TokenInfo>({
  sortComparer: (a, b) => a.name.localeCompare(b.name)
})

const initialState: TokensState = tokensAdapter.getInitialState({
  status: 'uninitialized'
})

export const syncNetworkTokensInfo = createAsyncThunk(`${sliceName}/syncNetworkTokensInfo`, async (_, { getState }) => {
  const state = getState() as RootState

  // TODO: Fetch metadata from GitHub instead of NPM package?
  const metadata =
    state.network.settings.networkId === 0
      ? TokensMetadata.mainnet
      : state.network.settings.networkId === 1
      ? TokensMetadata.testnet
      : undefined

  return metadata
})

const tokensSlice = createSlice({
  name: sliceName,
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(syncNetworkTokensInfo.fulfilled, (state, action) => {
        const metadata = action.payload

        if (metadata) {
          tokensAdapter.upsertMany(state, metadata.tokens)
          state.status = 'initialized'
        }
      })
      .addCase(networkPresetSwitched, clearTokens)
      .addCase(customNetworkSettingsSaved, clearTokens)
  }
})

export const { selectAll: selectAllTokens, selectById: selectTokenById } = tokensAdapter.getSelectors<RootState>(
  (state) => state[sliceName]
)

export const selectTokens = createSelector(
  [selectAllAddresses, selectAllTokens],
  (addresses, tokens): TokenDisplay[] => {
    const tokenBalances = addresses.reduce((acc, { tokens }) => {
      tokens.forEach((token) => {
        const existingToken = acc.find((t) => t.id === token.id)

        if (!existingToken) {
          acc.push({
            id: token.id,
            balance: BigInt(token.balance),
            lockedBalance: BigInt(token.lockedBalance)
          })
        } else {
          existingToken.balance = existingToken.balance + BigInt(token.balance)
          existingToken.lockedBalance = existingToken.lockedBalance + BigInt(token.lockedBalance)
        }
      })

      return acc
    }, [] as TokenDisplayBalances[])

    return tokenBalances.map((token) => {
      const tokenMetadata = tokens.find((t) => t.id === token.id)
      const trailingZeros = produceZeros(NUM_OF_ZEROS_IN_QUINTILLION - (tokenMetadata?.decimals ?? 0))

      return {
        id: token.id,
        balance: BigInt(token.balance.toString() + trailingZeros),
        lockedBalance: BigInt(token.lockedBalance.toString() + trailingZeros),
        name: tokenMetadata?.name ?? token.id,
        symbol: tokenMetadata?.symbol ?? '',
        description: tokenMetadata?.description,
        logoURI: tokenMetadata?.logoURI
      }
    })
  }
)

export default tokensSlice

const clearTokens = (state: TokensState) => {
  tokensAdapter.setAll(state, [])

  state.status = 'uninitialized'
}
