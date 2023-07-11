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

import { Asset, TokenDisplayBalances } from '@alephium/sdk'
import { ALPH } from '@alephium/token-list'
import { createSelector } from '@reduxjs/toolkit'
import { sortBy } from 'lodash'

import { addressesAdapter, contactsAdapter } from '@/storage/addresses/addressesAdapters'
import { selectAllAssetsInfo, selectAllNFTs, selectNFTIds } from '@/storage/assets/assetsSelectors'
import { RootState } from '@/storage/store'
import { Address, AddressHash } from '@/types/addresses'
import { NFT } from '@/types/assets'
import { filterAddressesWithoutAssets } from '@/utils/addresses'

export const {
  selectById: selectAddressByHash,
  selectAll: selectAllAddresses,
  selectIds: selectAddressIds
} = addressesAdapter.getSelectors<RootState>((state) => state.addresses)

export const makeSelectAddresses = () =>
  createSelector(
    [selectAllAddresses, (_, addressHashes?: AddressHash[] | AddressHash) => addressHashes],
    (allAddresses, addressHashes) =>
      addressHashes
        ? allAddresses.filter((address) =>
            Array.isArray(addressHashes) ? addressHashes.includes(address.hash) : addressHashes === address.hash
          )
        : allAddresses
  )

export const selectDefaultAddress = createSelector(selectAllAddresses, (addresses) =>
  addresses.find((address) => address.isDefault)
)

export const selectTotalBalance = createSelector([selectAllAddresses], (addresses) =>
  addresses.reduce((acc, address) => acc + BigInt(address.balance), BigInt(0))
)

export const makeSelectAddressesAlphAsset = () =>
  createSelector(makeSelectAddresses(), (addresses): Asset => {
    const alphBalances = addresses.reduce(
      (acc, { balance, lockedBalance }) => ({
        balance: acc.balance + BigInt(balance),
        lockedBalance: acc.lockedBalance + BigInt(lockedBalance)
      }),
      { balance: BigInt(0), lockedBalance: BigInt(0) }
    )

    return {
      ...ALPH,
      ...alphBalances,
      verified: true
    }
  })

export const makeSelectAddressesTokens = () =>
  createSelector(
    [selectAllAssetsInfo, selectAllNFTs, makeSelectAddressesAlphAsset(), makeSelectAddresses()],
    (assetsInfo, nfts, alphAsset, addresses): Asset[] => {
      const tokens = getAddressesTokenBalances(addresses).reduce((acc, token) => {
        const assetInfo = assetsInfo.find((t) => t.id === token.id)
        const nftInfo = nfts.find((nft) => nft.id === token.id)

        acc.push({
          id: token.id,
          balance: BigInt(token.balance.toString()),
          lockedBalance: BigInt(token.lockedBalance.toString()),
          name: assetInfo?.name ?? nftInfo?.name,
          symbol: assetInfo?.symbol,
          description: assetInfo?.description ?? nftInfo?.description,
          logoURI: assetInfo?.logoURI ?? nftInfo?.image,
          decimals: assetInfo?.decimals ?? 0,
          verified: assetInfo?.verified
        })

        return acc
      }, [] as Asset[])

      return [
        alphAsset,
        ...sortBy(tokens, [(a) => !a.verified, (a) => a.verified === undefined, (a) => a.name?.toLowerCase(), 'id'])
      ]
    }
  )

export const makeSelectAddressesKnownFungibleTokens = () =>
  createSelector([makeSelectAddressesTokens()], (tokens): Asset[] => tokens.filter((token) => !!token?.symbol))

export const makeSelectAddressesUnknownTokens = () =>
  createSelector(
    [selectAllAssetsInfo, selectNFTIds, makeSelectAddresses()],
    (assetsInfo, nftIds, addresses): Asset[] => {
      const tokensWithoutMetadata = getAddressesTokenBalances(addresses).reduce((acc, token) => {
        const hasTokenMetadata = !!assetsInfo.find((t) => t.id === token.id)
        const hasNFTMetadata = nftIds.includes(token.id)

        if (!hasTokenMetadata && !hasNFTMetadata) {
          acc.push({
            id: token.id,
            balance: BigInt(token.balance.toString()),
            lockedBalance: BigInt(token.lockedBalance.toString()),
            decimals: 0
          })
        }

        return acc
      }, [] as Asset[])

      return tokensWithoutMetadata
    }
  )

export const makeSelectAddressesCheckedUnknownTokens = () =>
  createSelector(
    [makeSelectAddressesUnknownTokens(), (state: RootState) => state.assetsInfo.checkedUnknownTokenIds],
    (tokensWithoutMetadata, checkedUnknownTokenIds) =>
      tokensWithoutMetadata.filter((token) => checkedUnknownTokenIds.includes(token.id))
  )

export const makeSelectAddressesNFTs = () =>
  createSelector([selectAllNFTs, makeSelectAddresses()], (nfts, addresses): NFT[] => {
    const addressesTokenIds = addresses.flatMap(({ tokens }) => tokens.map(({ id }) => id))

    return nfts.filter((nft) => addressesTokenIds.includes(nft.id))
  })

export const { selectAll: selectAllContacts } = contactsAdapter.getSelectors<RootState>((state) => state.contacts)

export const makeSelectContactByAddress = () =>
  createSelector([selectAllContacts, (_, addressHash) => addressHash], (contacts, addressHash) =>
    contacts.find((contact) => contact.address === addressHash)
  )

export const selectIsStateUninitialized = createSelector(
  (state: RootState) => state.addresses.status,
  (status) => status === 'uninitialized'
)

export const selectHaveAllPagesLoaded = createSelector(
  [selectAllAddresses, (state: RootState) => state.confirmedTransactions.allLoaded],
  (addresses, allTransactionsLoaded) =>
    addresses.every((address) => address.allTransactionPagesLoaded) || allTransactionsLoaded
)

export const selectHaveHistoricBalancesLoaded = createSelector(selectAllAddresses, (addresses) =>
  addresses.every((address) => address.balanceHistoryInitialized)
)

export const makeSelectAddressesHaveHistoricBalances = () =>
  createSelector(
    makeSelectAddresses(),
    (addresses) =>
      addresses.every((address) => address.balanceHistoryInitialized) &&
      addresses.some((address) => address.balanceHistory.ids.length > 0)
  )

export const selectAddressesWithSomeBalance = createSelector(selectAllAddresses, filterAddressesWithoutAssets)

const getAddressesTokenBalances = (addresses: Address[]) =>
  addresses.reduce((acc, { tokens }) => {
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
