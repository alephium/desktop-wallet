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

import { Asset } from '@alephium/sdk'
import { TokenList } from '@alephium/token-list'
import { createAction, createAsyncThunk } from '@reduxjs/toolkit'
import { omit } from 'lodash'

import client, { exponentialBackoffFetchRetry } from '@/api/client'
import { RootState } from '@/storage/store'
import { SyncUnknownTokensInfoResult } from '@/types/assets'

export const loadingStarted = createAction('assets/loadingStarted')

export const syncNetworkTokensInfo = createAsyncThunk(
  'assets/syncNetworkTokensInfo',
  async (_, { getState, dispatch }) => {
    const state = getState() as RootState

    dispatch(loadingStarted())

    let metadata = undefined
    const network =
      state.network.settings.networkId === 0
        ? 'mainnet'
        : state.network.settings.networkId === 1
        ? 'testnet'
        : undefined

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
  }
)

export const syncUnknownTokensInfo = createAsyncThunk(
  'assets/syncUnknownTokensInfo',
  async (unknownTokenIds: Asset['id'][], { dispatch }): Promise<SyncUnknownTokensInfoResult> => {
    const results = {
      tokens: [],
      nfts: []
    } as SyncUnknownTokensInfoResult

    dispatch(loadingStarted())

    for await (const id of unknownTokenIds) {
      const type = await client.node.guessStdTokenType(id)

      try {
        if (type === 'fungible') {
          const tokenMetadata = await client.node.fetchFungibleTokenMetaData(id)

          results.tokens.push({
            id,
            ...omit(tokenMetadata, ['totalSupply'])
          })
        } else if (type === 'non-fungible') {
          const { tokenUri, collectionAddress } = await client.node.fetchNFTMetaData(id)
          const nftData = await exponentialBackoffFetchRetry(tokenUri).then((res) => res.json())

          results.nfts.push({
            id,
            collectionAddress,
            name: nftData?.name,
            description: nftData?.description,
            image: nftData?.image
          })
        }
      } catch (e) {
        console.error(e)
      }
    }

    return results
  }
)
