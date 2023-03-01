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

import { NUM_OF_ZEROS_IN_QUINTILLION } from '@alephium/sdk'
import TokensMetadata, { TokenInfo } from '@alephium/token-list'
import { createAsyncThunk, createEntityAdapter, createSlice, EntityState } from '@reduxjs/toolkit'

import { customNetworkSettingsSaved, networkPresetSwitched } from '@/storage/app-state/slices/networkSlice'
import { RootState } from '@/storage/app-state/store'

const sliceName = 'assetsInfo'

export const ALPH = {
  id: '0',
  name: 'Alephium',
  symbol: 'ALPH',
  decimals: NUM_OF_ZEROS_IN_QUINTILLION
}

interface AssetsInfoState extends EntityState<TokenInfo> {
  status: 'initialized' | 'uninitialized'
}

const assetsInfoAdapter = createEntityAdapter<TokenInfo>({
  sortComparer: (a, b) => a.name.localeCompare(b.name)
})

const initialState: AssetsInfoState = assetsInfoAdapter.addOne(
  assetsInfoAdapter.getInitialState({
    status: 'uninitialized'
  }),
  {
    ...ALPH
  }
)

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

const assetsSlice = createSlice({
  name: sliceName,
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(syncNetworkTokensInfo.fulfilled, (state, action) => {
        const metadata = action.payload

        if (metadata) {
          assetsInfoAdapter.upsertMany(state, metadata.tokens)
          state.status = 'initialized'
        }
      })
      .addCase(networkPresetSwitched, clearAssetsInfo)
      .addCase(customNetworkSettingsSaved, clearAssetsInfo)
  }
})

export const { selectAll: selectAllAssetsInfo, selectById: selectAssetInfoById } =
  assetsInfoAdapter.getSelectors<RootState>((state) => state[sliceName])

export default assetsSlice

const clearAssetsInfo = (state: AssetsInfoState) => {
  assetsInfoAdapter.setAll(state, [])

  state.status = 'uninitialized'
}
