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

import { Transaction, UnconfirmedTransaction } from '@alephium/sdk/api/explorer'

import client from '@/api/client'
import { Address, AddressDataSyncResult, AddressHash } from '@/types/addresses'

export const fetchAddressesData = async (addressHashes: AddressHash[]): Promise<AddressDataSyncResult[]> => {
  const results = []

  for (const addressHash of addressHashes) {
    const { data: details } = await client.explorer.getAddressDetails(addressHash)
    const { data: transactions } = await client.explorer.getAddressTransactions(addressHash, 1)
    const { data: unconfirmedTransactions } =
      await client.explorer.addresses.getAddressesAddressUnconfirmedTransactions(addressHash)
    const { data: tokenIds } = await client.explorer.addresses.getAddressesAddressTokens(addressHash)

    const tokens = await Promise.all(
      tokenIds.map((id) =>
        client.explorer.addresses.getAddressesAddressTokensTokenIdBalance(addressHash, id).then(({ data }) => ({
          id,
          ...data
        }))
      )
    )

    results.push({
      hash: addressHash,
      details,
      transactions,
      // Type casting needed due to https://github.com/alephium/explorer-backend/issues/427
      unconfirmedTransactions: unconfirmedTransactions as UnconfirmedTransaction[],
      tokens
    })
  }

  return results
}

export const fetchAddressTransactionsNextPage = async (address: Address) => {
  let nextPage = address.transactionsPageLoaded
  let nextPageTransactions = [] as Transaction[]

  if (!address.allTransactionPagesLoaded) {
    nextPage += 1
    const { data: transactions } = await client.explorer.getAddressTransactions(address.hash, nextPage)
    nextPageTransactions = transactions
  }

  return {
    hash: address.hash,
    transactions: nextPageTransactions,
    page: nextPage
  }
}

export const fetchAddressesTransactionsNextPage = async (addresses: Address[], nextPage: number) => {
  const addressHashes = addresses.filter((address) => !address.allTransactionPagesLoaded).map((address) => address.hash)
  const { data: transactions } = await client.explorer.addresses.postAddressesTransactions(
    { page: nextPage },
    addressHashes
  )

  return transactions
}
