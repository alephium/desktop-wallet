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

import client from '@/api/client'
import { AddressHash } from '@/types/addresses'

export const fetchAddressesData = async (addressHashes: AddressHash[]) => {
  const results = []

  for (const addressHash of addressHashes) {
    console.log('⬇️ Fetching address details: ', addressHash)
    const { data: details } = await client.explorerClient.getAddressDetails(addressHash)

    console.log('⬇️ Fetching 1st page of address confirmed transactions: ', addressHash)
    const { data: transactions } = await client.explorerClient.getAddressTransactions(addressHash, 1)

    console.log('⬇️ Fetching address tokens: ', addressHash)
    const { data: tokenIds } = await client.explorerClient.addresses.getAddressesAddressTokens(addressHash)

    const tokens = await Promise.all(
      tokenIds.map((id) =>
        client.explorerClient.addresses.getAddressesAddressTokensTokenIdBalance(addressHash, id).then(({ data }) => ({
          id,
          balances: data
        }))
      )
    )

    results.push({
      hash: addressHash,
      details,
      transactions,
      tokens
    })
  }

  return results
}
