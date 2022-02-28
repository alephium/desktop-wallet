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

import { CliqueClient, ExplorerClient } from 'alephium-js'

import { Address, AddressHash, TransactionType } from '../contexts/addresses'
import { NetworkType, Settings } from './settings'

export async function createClient(settings: Settings['network']) {
  try {
    const cliqueClient = new CliqueClient({
      baseUrl: settings.nodeHost
    })

    const explorerClient = new ExplorerClient({
      baseUrl: settings.explorerApiHost
    })

    //TODO: Support multi-node clique
    const isMultiNodesClique = false

    console.log('Multi-nodes clique: not supported for now.')
    console.log('Connecting to: ' + cliqueClient.baseUrl)
    console.log('Explorer backend: ' + explorerClient.baseUrl)

    // Init clients
    await cliqueClient.init(isMultiNodesClique)

    const fetchAddressDetails = async (address: Address) => {
      console.log('⬇️ Fetching address details: ', address.hash)

      const { data } = await explorerClient.getAddressDetails(address.hash)
      address.details = data

      if (data.balance) address.availableBalance = BigInt(data.balance)
      if (data.lockedBalance) address.availableBalance -= BigInt(data.lockedBalance)

      return data
    }

    const fetchAddressConfirmedTransactions = async (address: Address, page = 1) => {
      console.log(`⬇️ Fetching page ${page} of address confirmed transactions: `, address.hash)

      const { data } = await explorerClient.getAddressTransactions(address.hash, page)

      const isInitialData = page === 1 && data.length > 0 && address.transactions.confirmed.length === 0
      const latestTxHashIsNew =
        page === 1 &&
        data.length > 0 &&
        address.transactions.confirmed.length > 0 &&
        data[0].hash !== address.transactions.confirmed[0].hash

      if (isInitialData) {
        address.transactions.confirmed = data
        address.transactions.loadedPage = 1
      } else if (latestTxHashIsNew || page > 1) {
        const newTransactions = data.filter(
          (tx) => !address.transactions.confirmed.find((confirmedTx) => confirmedTx.hash === tx.hash)
        )
        address.transactions.confirmed =
          page > 1
            ? address.transactions.confirmed.concat(newTransactions)
            : newTransactions.concat(address.transactions.confirmed)
        if (page > 1) {
          address.transactions.loadedPage = page
        }
      }

      address.lastUsed =
        address.transactions.confirmed.length > 0 ? address.transactions.confirmed[0].timestamp : address.lastUsed

      return data
    }

    const fetchAddressConfirmedTransactionsNextPage = async (address: Address) => {
      await fetchAddressConfirmedTransactions(address, address.transactions.loadedPage + 1)
    }

    const buildSweepTransactions = async (address: Address, toHash: AddressHash) => {
      const { data } = await cliqueClient.transactionConsolidateUTXOs(address.publicKey, address.hash, toHash)
      const fees = data.unsignedTxs.reduce((acc, tx) => acc + BigInt(tx.gasPrice) * BigInt(tx.gasAmount), BigInt(0))

      return {
        unsignedTxs: data.unsignedTxs,
        fees
      }
    }

    const signAndSendTransaction = async (
      address: Address,
      txId: string,
      unsignedTx: string,
      toHash: AddressHash,
      type: TransactionType,
      network: NetworkType,
      amount?: bigint
    ) => {
      const signature = cliqueClient.transactionSign(txId, address.privateKey)
      const response = await cliqueClient.transactionSend(toHash, unsignedTx, signature)

      if (response.data) {
        address.addPendingTransaction({
          txId: response.data.txId,
          fromAddress: address.hash,
          toAddress: toHash,
          timestamp: new Date().getTime(),
          amount,
          type,
          network
        })
      }

      return response.data
    }

    return {
      clique: cliqueClient,
      explorer: explorerClient,
      fetchAddressDetails,
      fetchAddressConfirmedTransactions,
      fetchAddressConfirmedTransactionsNextPage,
      buildSweepTransactions,
      signAndSendTransaction
    }
  } catch (error) {
    console.error(error)
    return false
  }
}
