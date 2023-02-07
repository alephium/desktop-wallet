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

import AddressMetadataStorage from '@/persistent-storage/address-metadata'
import { DataKey } from '@/persistent-storage/encrypted-storage'
import { newAddressGenerated } from '@/store/addressesSlice'
import { store } from '@/store/store'
import { AddressBase, AddressHash, AddressRedux } from '@/types/addresses'
import { AddressTransaction, PendingTransaction } from '@/types/transactions'
import { getRandomLabelColor } from '@/utils/colors'

export const selectAddressTransactions = (
  allAddresses: AddressRedux[],
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

export const initialAddressSettings = {
  isDefault: true,
  color: getRandomLabelColor()
}

export const getAvailableBalance = (address: AddressRedux): bigint =>
  BigInt(address.balance) - BigInt(address.lockedBalance)

export const getName = (address: AddressRedux): string => address.label ?? `${address.hash.substring(0, 10)}...`

// TODO: Is there a better place for this function? It fits both in `@/persistant-storage` and `@/store/addressesSlice`
// Potentially, it could become a hook (`useSaveNewAddress`) so that the `dataKey` (wallet name and mnemonic) do not
// need to be passed as props.
export const saveNewAddress = (address: AddressBase, dataKey: DataKey) => {
  AddressMetadataStorage.store({
    dataKey,
    index: address.index,
    settings: {
      isDefault: address.isDefault,
      label: address.label,
      color: address.color
    }
  })

  store.dispatch(newAddressGenerated(address))
}
