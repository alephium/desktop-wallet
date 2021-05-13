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
import { Transaction } from 'alf-client/dist/api/api-explorer'

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

// ==================== //
// === STRING MANIP === //
// ==================== //

const MONEY_SYMBOL_BIG = ['', 'K', 'M', 'B', 'T']
const MONEY_SYMBOL_SMALL = ['', 'm', 'μ', 'n', 'p']

export const abbreviateAmount = (num: number) => {
  if (num < 0) return '0.00'

  // what tier? (determines SI symbol)
  let tier = (Math.round(Math.log10(Number(num))) / 3) | 0

  if (tier < 0 && Math.abs(tier) >= MONEY_SYMBOL_SMALL.length) tier = -MONEY_SYMBOL_SMALL.length + 1
  else if (tier == 0) return num.toFixed(2).toString()
  else if (tier >= MONEY_SYMBOL_BIG.length) tier = MONEY_SYMBOL_BIG.length - 1

  // get suffix and determine scale
  const suffix = tier >= 0 ? MONEY_SYMBOL_BIG[tier] : MONEY_SYMBOL_SMALL[Math.abs(tier)]

  const scale = Math.pow(10, tier * 3)

  // scale the bigNum
  const scaled = num / scale
  return scaled.toFixed(2) + suffix
}

export const truncate = (str: string) => {
  const len = str.length
  return len > 10 ? str.substring(0, 6) + '...' + str.substring(len - 6, len) : str
}

// ==================== //
// ===== BALANCES ===== //
// ==================== //

export function calAmountDelta(t: Transaction, id: string) {
  if (t.inputs && t.outputs) {
    const inputAmount = t.inputs.reduce<number>((acc, input) => {
      return input.amount && input.address === id ? acc + input.amount : acc
    }, 0)
    const outputAmount = t.outputs.reduce<number>((acc, output) => {
      return output.address === id ? acc + output.amount : acc
    }, 0)
    return outputAmount - inputAmount
  } else {
    throw 'Missing transaction details'
  }
}
