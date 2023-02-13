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

import { CliqueClient, ExplorerClient } from '@alephium/sdk'
import { NodeProvider as Web3Client } from '@alephium/web3'

import { AddressRedux } from '@/types/addresses'
import { NetworkName } from '@/types/network'
import { Settings } from '@/types/settings'

export async function createClient(settings: Settings['network']) {
  try {
    const cliqueClient = new CliqueClient({
      baseUrl: settings.nodeHost
    })

    const web3Client = new Web3Client(settings.nodeHost)

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

    const signAndSendContractOrScript = async (
      address: AddressRedux,
      txId: string,
      unsignedTx: string,
      network: NetworkName
    ) => {
      const signature = cliqueClient.transactionSign(txId, address.privateKey)
      const response = await cliqueClient.transactionSend(address.hash, unsignedTx, signature)

      // if (response.data) {
      //   address.addPendingTransaction({
      //     txId: response.data.txId,
      //     fromAddress: address.hash,
      //     toAddress: '',
      //     timestamp: new Date().getTime(),
      //     type: 'contract',
      //     network,
      //     status: 'pending'
      //   })
      // }

      return { ...response.data, signature: signature }
    }

    return {
      clique: cliqueClient,
      web3: web3Client,
      explorer: explorerClient,
      signAndSendContractOrScript
    }
  } catch (error) {
    console.error(error)
    return undefined
  }
}
