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

import { explorer } from '@alephium/web3'

import client from '@/api/client'
import { Address, AddressDataSyncResult, AddressHash } from '@/types/addresses'

export const fetchAddressesData = async (addressHashes: AddressHash[]): Promise<AddressDataSyncResult[]> => {
  const results = []

  for (const addressHash of addressHashes) {
    const balances = await client.explorer.addresses.getAddressesAddressBalance(addressHash)
    const txNumber = await client.explorer.addresses.getAddressesAddressTotalTransactions(addressHash)
    const transactions = await client.explorer.addresses.getAddressesAddressTransactions(addressHash, { page: 1 })
    const mempoolTransactions = await client.explorer.addresses.getAddressesAddressMempoolTransactions(addressHash)
    const tokenIds = await client.explorer.addresses.getAddressesAddressTokens(addressHash)

    const tokens = await Promise.all(
      tokenIds.map((id) =>
        client.explorer.addresses.getAddressesAddressTokensTokenIdBalance(addressHash, id).then((data) => ({
          id,
          ...data
        }))
      )
    )

    results.push({
      hash: addressHash,
      details: {
        ...balances,
        txNumber
      },
      transactions,
      mempoolTransactions,
      tokens
    })
  }

  return results
}

export const fetchAddressTransactionsNextPage = async (address: Address) => {
  let nextPage = address.transactionsPageLoaded
  let nextPageTransactions = [] as explorer.Transaction[]

  if (!address.allTransactionPagesLoaded) {
    nextPage += 1
    nextPageTransactions = await client.explorer.addresses.getAddressesAddressTransactions(address.hash, {
      page: nextPage
    })
  }

  return {
    hash: address.hash,
    transactions: nextPageTransactions,
    page: nextPage
  }
}

export const fetchAddressesTransactionsNextPage = async (addresses: Address[], nextPage: number) => {
  const addressHashes = addresses.filter((address) => !address.allTransactionPagesLoaded).map((address) => address.hash)
  const transactions = await client.explorer.addresses.postAddressesTransactions({ page: nextPage }, addressHashes)

  return transactions
}
