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

import { Transaction } from '@alephium/sdk/api/explorer'

import { Address, AddressHash, AddressSettings } from '@/types/addresses'
import { AddressTransaction, PendingTransaction } from '@/types/transactions'
import { getRandomLabelColor } from '@/utils/colors'

export const selectAddressTransactions = (
  allAddresses: Address[],
  transactions: (Transaction | PendingTransaction)[],
  addressHashes: AddressHash[]
) => {
  const addresses = allAddresses.filter((address) => addressHashes.includes(address.hash))
  const addressesTxs = addresses.flatMap((address) => address.transactions.map((txHash) => ({ txHash, address })))

  return transactions.reduce((txs, tx) => {
    const addressTx = addressesTxs.find(({ txHash }) => txHash === tx.hash)
    if (addressTx) txs.push({ ...tx, address: addressTx.address })

    return txs
  }, [] as AddressTransaction[])
}

export const getAvailableBalance = (address: Address): bigint => BigInt(address.balance) - BigInt(address.lockedBalance)

export const getName = (address: Address): string => address.label ?? `${address.hash.substring(0, 10)}...`

export const getInitialAddressSettings = (): AddressSettings => ({
  isDefault: true,
  color: getRandomLabelColor()
})

export const filterAddresses = (addresses: Address[], text: string) =>
  text.length < 2
    ? addresses
    : addresses.filter(
        // TODO: Include tokens in search
        (address) => address.label?.toLowerCase().includes(text) || address.hash.toLowerCase().includes(text)
      )
