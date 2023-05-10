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

import { transactionSign } from '@alephium/web3'

import client from '@/api/client'
import { Address, AddressHash } from '@/types/addresses'
import { CsvExportQueryParams } from '@/types/transactions'

export const buildSweepTransactions = async (fromAddress: Address, toAddressHash: AddressHash) => {
  const { unsignedTxs } = await client.node.transactions.postTransactionsSweepAddressBuild({
    fromPublicKey: fromAddress.publicKey,
    toAddress: toAddressHash
  })

  return {
    unsignedTxs,
    fees: unsignedTxs.reduce((acc, tx) => acc + BigInt(tx.gasPrice) * BigInt(tx.gasAmount), BigInt(0))
  }
}

export const signAndSendTransaction = async (fromAddress: Address, txId: string, unsignedTx: string) => {
  const signature = transactionSign(txId, fromAddress.privateKey)
  const data = await client.node.transactions.postTransactionsSubmit({ unsignedTx, signature })

  return { ...data, signature }
}

export const fetchCsv = async ({ addressHash, ...timeRangeQueryParams }: CsvExportQueryParams) =>
  await client.explorer.addresses.getAddressesAddressExportTransactionsCsv(addressHash, timeRangeQueryParams, {
    format: 'text'
  })
