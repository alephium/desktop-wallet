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
import { Address, AddressHash } from '@/types/addresses'
import { getAvailableBalance } from '@/utils/addresses'

export const buildSweepTransactions = async (fromAddress: Address, toAddressHash: AddressHash) => {
  const { data } = await client.clique.transactionConsolidateUTXOs(
    fromAddress.publicKey,
    fromAddress.hash,
    toAddressHash
  )

  return {
    unsignedTxs: data.unsignedTxs,
    fees: data.unsignedTxs.reduce((acc, tx) => acc + BigInt(tx.gasPrice) * BigInt(tx.gasAmount), BigInt(0))
  }
}

export const buildUnsignedTransactions = async (
  fromAddress: Address,
  toAddressHash: string,
  amountInSet: bigint,
  gasAmount: string,
  gasPriceInSet?: bigint
) => {
  const isSweep = amountInSet.toString() === getAvailableBalance(fromAddress).toString()

  if (isSweep) {
    return await buildSweepTransactions(fromAddress, toAddressHash)
  } else {
    const { data } = await client.clique.transactionCreate(
      fromAddress.hash,
      fromAddress.publicKey,
      toAddressHash,
      amountInSet.toString(),
      undefined,
      gasAmount ? parseInt(gasAmount) : undefined,
      gasPriceInSet ? gasPriceInSet.toString() : undefined
    )

    return {
      unsignedTxs: [{ txId: data.txId, unsignedTx: data.unsignedTx }],
      fees: BigInt(data.gasAmount) * BigInt(data.gasPrice)
    }
  }
}

export const signAndSendTransaction = async (fromAddress: Address, txId: string, unsignedTx: string) => {
  const signature = client.clique.transactionSign(txId, fromAddress.privateKey)
  const { data } = await client.clique.transactionSend(fromAddress.hash, unsignedTx, signature)

  return { ...data, signature: signature }
}
