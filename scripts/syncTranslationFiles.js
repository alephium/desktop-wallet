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

const glob = require('glob')
const fs = require('fs')

const sourceOfTruthFile = 'locales/en-US/translation.json'

const sync = () => {
  const source = JSON.parse(fs.readFileSync(sourceOfTruthFile, { encoding: 'utf-8' }))
  const allTranslationFiles = glob.sync('locales/**/*.json').filter((path) => path !== sourceOfTruthFile)

  allTranslationFiles.forEach((filepath) => {
    try {
      const data = JSON.parse(fs.readFileSync(filepath, { encoding: 'utf-8' }))
      const newData = {}

      Object.keys(data).forEach((key) => {
        if (source[key]) newData[key] = data[key]
      })

      Object.keys(source).forEach((key) => {
        if (!newData[key]) newData[key] = source[key]
      })

      fs.writeFileSync(filepath, JSON.stringify(newData))
    } catch (e) {
      console.error('Error occurred while parsing file "' + filepath + '"')
    }
  })
}

sync()
