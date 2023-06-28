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

import { createSelector } from '@reduxjs/toolkit'

import { assetsInfoAdapter, nftsAdapter } from '@/storage/assets/assetsAdapter'
import { networkPresets } from '@/storage/settings/settingsPersistentStorage'
import { RootState } from '@/storage/store'

export const { selectAll: selectAllAssetsInfo, selectById: selectAssetInfoById } =
  assetsInfoAdapter.getSelectors<RootState>((state) => state.assetsInfo)

export const selectIsLoadingTokensInfo = createSelector(
  [(state: RootState) => state.assetsInfo.status, (state: RootState) => state.network.settings.networkId],
  (status, networkId) =>
    (networkId === networkPresets.mainnet.networkId || networkId === networkPresets.testnet.networkId) &&
    status === 'uninitialized'
)

export const {
  selectAll: selectAllNFTs,
  selectById: selectNFTById,
  selectIds: selectNFTIds
} = nftsAdapter.getSelectors<RootState>((state) => state.nfts)
