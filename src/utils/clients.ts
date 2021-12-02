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
import { isEqual } from 'lodash'
import { useContext } from 'react'

import { GlobalContext } from '../App'

// =================== //
// === API CLIENTS === //
// =================== //

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

// ================ //
// === SETTINGS === //
// ================ //

export interface Settings {
  nodeHost: string
  explorerApiHost: string
  explorerUrl: string
}

export const networkTypes = ['testnet', 'mainnet', 'localhost', 'custom'] as const
export type NetworkType = typeof networkTypes[number]

export const networkEndpoints: Record<Exclude<NetworkType, 'custom'>, Settings> = {
  mainnet: {
    nodeHost: 'https://mainnet-wallet.alephium.org',
    explorerApiHost: 'https://mainnet-backend.alephium.org',
    explorerUrl: 'https://explorer.alephium.org'
  },
  testnet: {
    nodeHost: 'https://testnet-wallet.alephium.org',
    explorerApiHost: 'https://testnet-backend.alephium.org',
    explorerUrl: 'https://testnet.alephium.org'
  },
  localhost: {
    nodeHost: 'http://localhost:12973',
    explorerApiHost: 'http://localhost:9090',
    explorerUrl: 'http://localhost:3000'
  }
}

export const getNetworkName = (settings: Settings) => {
  return (Object.entries(networkEndpoints).find(([networkType, presetSettings]) => {
    return isEqual(presetSettings, settings)
  })?.[0] || 'custom') as NetworkType | 'custom'
}

export const useCurrentNetwork = () => {
  const { settings } = useContext(GlobalContext)
  return getNetworkName(settings)
}

export function settingsDefault(): Settings {
  return networkEndpoints.mainnet
}

export function loadSettings(): Settings {
  const storedSettings = window.localStorage.getItem('settings')

  return storedSettings ? JSON.parse(storedSettings) : settingsDefault()
}

export function saveSettings(settings: Settings) {
  const str = JSON.stringify(settings)
  window.localStorage.setItem('settings', str)
}
