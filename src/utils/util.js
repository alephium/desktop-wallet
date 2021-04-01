// Copyright 2018 The Alephium Authors
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

import ALF from "alf-client";

var MONEY_SYMBOL = ["", "K", "M", "B", "T"];

export const abbreviateAmount = (num) => {
  if (num < 0) return '0.00'

  // what tier? (determines SI symbol)
  let tier = Math.log10(Number(num)) / 3 | 0

  // if zero, we don't need a suffix
  if(tier <= 0) return num.toFixed(2).toString()
  if(tier >= MONEY_SYMBOL.length) tier = MONEY_SYMBOL.length - 1

  // get suffix and determine scale
  const suffix = MONEY_SYMBOL[tier]
  const scale = Math.pow(10, tier * 3)

  // scale the bigNum
  let scaled = num / scale
  return scaled.toFixed(2) + suffix
}

export async function createClient() {
  let settings = settingsLoadOrDefault();
  const client = new ALF.NodeClient({
    host: settings.host,
    port: settings.port
  });

  console.log('Connecting to: ' + client.host + ':' + client.port);

  const response = await client.selfClique();
  if (!response) {
    console.log('Self clique not found.');
    return;
  }

  const clique = new ALF.CliqueClient(response);
  return clique;
}

export function settingsDefault() {
  return {
        host: 'localhost',
        port: 12973,
        explorerHost: 'localhost',
        explorerPort: 9090,
        alephscanURL: 'http://localhost:3000',
  }
}

export function settingsLoad() {
  const str = window.localStorage.getItem('settings');
  if (typeof str !== 'undefined') {
    return JSON.parse(str);
  } else {
    return null;
  }
}

export function settingsLoadOrDefault() {
  const settings = settingsLoad();
  if (!settings) {
    return settingsDefault();
  } else {
    return settings;
  }
}

export function settingsSave(settings) {
  const str = JSON.stringify(settings);
  window.localStorage.setItem('settings', str);
}
