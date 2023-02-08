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

import { defaultSettings } from '@/persistent-storage/settings'
import { NetworkSettings } from '@/types/settings'

export class Client {
  cliqueClient: CliqueClient
  explorerClient: ExplorerClient
  web3Client: Web3Client

  constructor() {
    const { nodeHost, explorerApiHost } = defaultSettings.network

    this.cliqueClient = new CliqueClient({ baseUrl: nodeHost })
    this.explorerClient = new ExplorerClient({ baseUrl: explorerApiHost })
    this.web3Client = new Web3Client(nodeHost)
  }

  async init(
    nodeHost: NetworkSettings['nodeHost'],
    explorerApiHost: NetworkSettings['explorerApiHost'],
    isMultiNodesClique = false
  ) {
    this.cliqueClient = new CliqueClient({ baseUrl: nodeHost })
    this.explorerClient = new ExplorerClient({ baseUrl: explorerApiHost })
    this.web3Client = new Web3Client(nodeHost)

    await this.cliqueClient.init(isMultiNodesClique)
  }
}

const client = new Client()

export default client
