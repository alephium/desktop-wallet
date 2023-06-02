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

const electron = require('electron')
const path = require('path')
const fs = require('fs')

class Store {
  constructor(opts) {
    const appDataPath = electron.app.getPath('userData')
    this.path = path.join(appDataPath, opts.configName + '.json')
    console.log(this.path)
    this.data = parseDataFile(this.path, opts.defaults)
    console.log(this.path)
  }

  get(key) {
    return this.data[key]
  }

  set(key, val) {
    this.data[key] = val
    console.log(this.path)
    console.log(this.data[key])
    fs.writeFileSync(this.path, JSON.stringify(this.data))
  }
}

function parseDataFile(filePath, defaults) {
  try {
    return JSON.parse(fs.readFileSync(filePath))
  } catch (error) {
    return defaults
  }
}

module.exports = Store
