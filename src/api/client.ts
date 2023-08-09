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

import { ExplorerProvider, NodeProvider } from '@alephium/web3'

import { exponentialBackoffFetchRetry } from '@/api/fetchRetry'
import { defaultSettings } from '@/storage/settings/settingsPersistentStorage'
import { NetworkSettings } from '@/types/settings'

export class Client {
  explorer: ExplorerProvider
  node: NodeProvider

  constructor() {
    const { nodeHost, explorerApiHost } = defaultSettings.network
    const { explorer, node } = this.getClients(nodeHost, explorerApiHost)

    this.explorer = explorer
    this.node = node
  }

  init(nodeHost: NetworkSettings['nodeHost'], explorerApiHost: NetworkSettings['explorerApiHost']) {
    const { explorer, node } = this.getClients(nodeHost, explorerApiHost)

    this.explorer = explorer
    this.node = node
  }

  private getClients(nodeHost: NetworkSettings['nodeHost'], explorerApiHost: NetworkSettings['explorerApiHost']) {
    return {
      explorer: new ExplorerProvider(explorerApiHost, undefined, exponentialBackoffFetchRetry),
      node: new NodeProvider(nodeHost, undefined, exponentialBackoffFetchRetry)
    }
  }
}

const client = new Client()

export default client
