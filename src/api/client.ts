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
import { NodeProvider as Web3Client, throttledFetch } from '@alephium/web3'

import { defaultSettings } from '@/storage/persistent-storage/settingsPersistentStorage'
import { NetworkSettings } from '@/types/settings'

export class Client {
  clique: CliqueClient
  explorer: ExplorerClient
  web3: Web3Client

  constructor() {
    const { nodeHost, explorerApiHost } = defaultSettings.network
    const { clique, explorer, web3 } = this.getClients(nodeHost, explorerApiHost)

    this.clique = clique
    this.explorer = explorer
    this.web3 = web3
  }

  async init(
    nodeHost: NetworkSettings['nodeHost'],
    explorerApiHost: NetworkSettings['explorerApiHost'],
    isMultiNodesClique = false
  ) {
    const { clique, explorer, web3 } = this.getClients(nodeHost, explorerApiHost)

    this.clique = clique
    this.explorer = explorer
    this.web3 = web3

    await this.clique.init(isMultiNodesClique)
  }

  private getClients(nodeHost: NetworkSettings['nodeHost'], explorerApiHost: NetworkSettings['explorerApiHost']) {
    return {
      clique: new CliqueClient({ baseUrl: nodeHost, customFetch: throttledFetch(5) }),
      explorer: new ExplorerClient({ baseUrl: explorerApiHost, customFetch: throttledFetch(5) }),
      web3: new Web3Client(nodeHost, undefined, throttledFetch(5))
    }
  }
}

const client = new Client()

export default client
