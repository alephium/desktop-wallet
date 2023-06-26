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

import { createSlice, EntityState } from '@reduxjs/toolkit'

import { syncUnknownTokensInfo } from '@/storage/assets/assetsActions'
import { nftsAdapter } from '@/storage/assets/assetsAdapter'
import { customNetworkSettingsSaved, networkPresetSwitched } from '@/storage/settings/networkActions'
import { NFT } from '@/types/assets'

type NFTsState = EntityState<NFT>

const initialState: NFTsState = nftsAdapter.getInitialState()

const nftsSlice = createSlice({
  name: 'nfts',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(syncUnknownTokensInfo.fulfilled, (state, action) => {
        const nfts = action.payload.nfts

        nftsAdapter.upsertMany(state, nfts)
      })
      .addCase(networkPresetSwitched, resetState)
      .addCase(customNetworkSettingsSaved, resetState)
  }
})

export default nftsSlice

const resetState = () => initialState
