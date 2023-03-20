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

import { ALPH } from '@alephium/token-list'
import { createSelector } from '@reduxjs/toolkit'

import { addressesAdapter, contactsAdapter } from '@/storage/addresses/addressesAdapters'
import { selectAllAssetsInfo } from '@/storage/assets/assetsSelectors'
import { RootState } from '@/storage/store'
import { AddressHash } from '@/types/addresses'
import { Asset, TokenDisplayBalances } from '@/types/assets'

export const {
  selectById: selectAddressByHash,
  selectAll: selectAllAddresses,
  selectIds: selectAddressIds
} = addressesAdapter.getSelectors<RootState>((state) => state.addresses)

export const selectAddresses = createSelector(
  [selectAllAddresses, (_, addressHashes: AddressHash[]) => addressHashes],
  (allAddresses, addressHashes) => allAddresses.filter((address) => addressHashes.includes(address.hash))
)

export const selectDefaultAddress = createSelector(selectAllAddresses, (addresses) =>
  addresses.find((address) => address.isDefault)
)

export const selectTotalBalance = createSelector([selectAllAddresses], (addresses) =>
  addresses.reduce((acc, address) => acc + BigInt(address.balance), BigInt(0))
)

export const selectAddressesAlphAsset = createSelector(
  [selectAllAddresses, (_, addressHashes?: AddressHash[]) => addressHashes],
  (allAddresses, addressHashes): Asset => {
    const addresses = addressHashes
      ? allAddresses.filter((address) => addressHashes.includes(address.hash))
      : allAddresses
    const alphBalances = addresses.reduce(
      (acc, { balance, lockedBalance }) => ({
        balance: acc.balance + BigInt(balance),
        lockedBalance: acc.lockedBalance + BigInt(lockedBalance)
      }),
      { balance: BigInt(0), lockedBalance: BigInt(0) }
    )

    return {
      ...ALPH,
      ...alphBalances
    }
  }
)

export const selectAddressesAssets = createSelector(
  [
    selectAllAddresses,
    selectAllAssetsInfo,
    selectAddressesAlphAsset,
    (_, addressHashes?: AddressHash[]) => addressHashes
  ],
  (allAddresses, assetsInfo, alphAsset, addressHashes): Asset[] => {
    const addresses = addressHashes
      ? allAddresses.filter((address) => addressHashes.includes(address.hash))
      : allAddresses
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

    const tokenAssets = tokenBalances.map((token) => {
      const assetInfo = assetsInfo.find((t) => t.id === token.id)

      return {
        id: token.id,
        balance: BigInt(token.balance.toString()),
        lockedBalance: BigInt(token.lockedBalance.toString()),
        name: assetInfo?.name,
        symbol: assetInfo?.symbol,
        description: assetInfo?.description,
        logoURI: assetInfo?.logoURI,
        decimals: assetInfo?.decimals ?? 0
      }
    })

    return [alphAsset, ...tokenAssets]
  }
)

export const { selectAll: selectAllContacts } = contactsAdapter.getSelectors<RootState>((state) => state.contacts)

export const selectContactByAddress = createSelector(
  [selectAllContacts, (_, addressHash) => addressHash],
  (contacts, addressHash) => contacts.find((contact) => contact.address === addressHash)
)
