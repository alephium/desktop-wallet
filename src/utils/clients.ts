// Copyright 2021 The Alephium Authors
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

import { CliqueClient, ExplorerClient } from 'alf-client'

// =================== //
// === API CLIENTS === //
// =================== //

export async function createClient() {
  const settings = loadSettingsOrDefault()
  const cliqueClient = new CliqueClient({
    baseUrl: `http://${settings.host}${settings.port ? ':' : ''}${settings.port}`
  })

  const explorerClient = new ExplorerClient({
    baseUrl: `${settings.explorerApiHost}${settings.explorerApiPort ? ':' : ''}${settings.explorerApiPort || ''}`
  })

  console.log('Connecting to: ' + cliqueClient.baseUrl)
  console.log('Explorer backend: ' + explorerClient.baseUrl)

  // Init clients
  await cliqueClient.init()

  return { clique: cliqueClient, explorer: explorerClient }
}

// ================ //
// === SETTINGS === //
// ================ //

interface Settings {
  host: string
  port: number
  explorerApiHost: string
  explorerApiPort: number | null
  explorerUrl: string
}

export function settingsDefault(): Settings {
  return {
    host: 'localhost',
    port: 12973,
    explorerApiHost: 'https://testnet-backend.alephium.org',
    explorerApiPort: null,
    explorerUrl: 'http://testnet.alephium.org'
  }
}

export function loadSettings(): Settings | null {
  const str = window.localStorage.getItem('settings')
  if (str) {
    return JSON.parse(str)
  } else {
    return null
  }
}

export function loadSettingsOrDefault() {
  const settings = loadSettings()
  if (!settings) {
    return settingsDefault()
  } else {
    return settings
  }
}

export function saveSettings(settings: Settings) {
  const str = JSON.stringify(settings)
  window.localStorage.setItem('settings', str)
}
