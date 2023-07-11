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

import { AssetAmount, AssetInfo } from '@alephium/sdk'
import { ALPH } from '@alephium/token-list'
import { explorer } from '@alephium/web3'
import { Dictionary } from '@reduxjs/toolkit'

import { Address, AddressSettings } from '@/types/addresses'
import { AddressTransaction, PendingTransaction } from '@/types/transactions'
import { getRandomLabelColor } from '@/utils/colors'

export const selectAddressTransactions = (
  addresses: Address[],
  transactions: (explorer.Transaction | PendingTransaction)[]
) => {
  const addressesTxs = addresses.flatMap((address) => address.transactions.map((txHash) => ({ txHash, address })))
  const processedTxHashes: explorer.Transaction['hash'][] = []

  return transactions.reduce((txs, tx) => {
    const addressTxs = addressesTxs.filter(({ txHash }) => txHash === tx.hash)

    addressTxs.forEach((addressTx) => {
      if (
        (!isPendingTransaction(tx) || [tx.fromAddress, tx.toAddress].includes(addressTx.address.hash)) &&
        !processedTxHashes.includes(tx.hash)
      ) {
        processedTxHashes.push(tx.hash)
        txs.push({ ...tx, address: addressTx.address })
      }
    })

    return txs
  }, [] as AddressTransaction[])
}

export const getAvailableBalance = (address: Address): bigint => BigInt(address.balance) - BigInt(address.lockedBalance)

export const getName = (address: Address): string => address.label || `${address.hash.substring(0, 10)}...`

export const getInitialAddressSettings = (): AddressSettings => ({
  isDefault: true,
  color: getRandomLabelColor()
})

export const filterAddresses = (addresses: Address[], text: string, assetsInfo: Dictionary<AssetInfo>) =>
  text.length < 2
    ? addresses
    : addresses.filter((address) => {
        const addressTokenIds = address.tokens.filter((token) => token.balance !== '0').map((token) => token.id)
        const addressTokenNames = addressTokenIds
          .map((tokenId) => {
            const tokenInfo = assetsInfo[tokenId]
            return tokenInfo ? `${tokenInfo.name} ${tokenInfo.symbol}` : undefined
          })
          .filter((searchableText) => searchableText !== undefined)
          .join(' ')

        const addressAssetNames = `${address.balance !== '0' ? 'Alephium ALPH ' : ''}${addressTokenNames}`.toLowerCase()

        return (
          address.label?.toLowerCase().includes(text) ||
          address.hash.toLowerCase().includes(text) ||
          addressAssetNames.includes(text)
        )
      })

export const getAddressAssetsAvailableBalance = (address: Address) => [
  {
    id: ALPH.id,
    availableBalance: getAvailableBalance(address)
  },
  ...address.tokens.map((token) => ({
    id: token.id,
    availableBalance: BigInt(token.balance) - BigInt(token.lockedBalance)
  }))
]

export const assetAmountsWithinAvailableBalance = (address: Address, assetAmounts: AssetAmount[]) => {
  const assetsAvailableBalance = getAddressAssetsAvailableBalance(address)

  return assetAmounts.every((asset) => {
    if (!asset?.amount) return true

    const assetAvailableBalance = assetsAvailableBalance.find(({ id }) => id === asset.id)?.availableBalance

    if (!assetAvailableBalance) return false
    return asset.amount <= assetAvailableBalance
  })
}

const isPendingTransaction = (tx: explorer.Transaction | PendingTransaction): tx is PendingTransaction =>
  (tx as PendingTransaction).status === 'pending'

export const addressHasAssets = (address: Address): boolean =>
  address.balance !== '0' || address.tokens.some((token) => token.balance !== '0')

export const filterAddressesWithoutAssets = (addresses: Address[]): Address[] => addresses.filter(addressHasAssets)
