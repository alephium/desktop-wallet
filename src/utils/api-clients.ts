// Copyright 2018 - 2021 The Alephium Authors
// This file is part of the alephium project.
//
// The library is free software: you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// The library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public License
// along with the library. If not, see <http://www.gnu.org/licenses/>.

import { CliqueClient, ExplorerClient } from 'alephium-js'

import { Settings, loadSettings } from './settings'

export async function createClient(settings?: Settings) {
  const loadedSettings = settings || loadSettings()
  const cliqueClient = new CliqueClient({
    baseUrl: loadedSettings.nodeHost
  })

  const explorerClient = new ExplorerClient({
    baseUrl: loadedSettings.explorerApiHost
  })

  //TODO: Support multi-node clique
  const isMultiNodesClique = false

  console.log('Multi-nodes clique: not supported for now.')
  console.log('Connecting to: ' + cliqueClient.baseUrl)
  console.log('Explorer backend: ' + explorerClient.baseUrl)

  // Init clients
  await cliqueClient.init(isMultiNodesClique)

  return { clique: cliqueClient, explorer: explorerClient }
}
