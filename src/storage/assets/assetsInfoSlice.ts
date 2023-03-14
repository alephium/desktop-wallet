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
import { TokenInfo, TokenList } from '@alephium/token-list'
import { createAsyncThunk, createEntityAdapter, createSelector, createSlice, EntityState } from '@reduxjs/toolkit'

import { customNetworkSettingsSaved, networkPresetSwitched } from '@/storage/settings/networkSlice'
import { networkPresets } from '@/storage/settings/settingsPersistentStorage'
import { RootState } from '@/storage/store'

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

  let metadata = undefined
  const network =
    state.network.settings.networkId === 0 ? 'mainnet' : state.network.settings.networkId === 1 ? 'testnet' : undefined

  if (network) {
    try {
      const response = await fetch(
        `https://raw.githubusercontent.com/alephium/token-list/master/tokens/${network}.json`
      )
      metadata = (await response.json()) as TokenList
    } catch (e) {
      console.warn('No metadata for network ID ', state.network.settings.networkId)
    }
  }

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

export const selectIsLoadingAssetsInfo = createSelector(
  [(state: RootState) => state.assetsInfo.status, (state: RootState) => state.network.settings.networkId],
  (status, networkId) =>
    (networkId === networkPresets.mainnet.networkId || networkId === networkPresets.testnet.networkId) &&
    status === 'uninitialized'
)

export default assetsSlice

const clearAssetsInfo = (state: AssetsInfoState) => {
  assetsInfoAdapter.setAll(state, [])

  state.status = 'uninitialized'
}
