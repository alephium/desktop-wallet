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

import fs from 'fs/promises'
import http from 'http'
import https from 'https'
import { uniq } from 'lodash'
import path from 'path'

const pathsToUIRelatedCode = [
  path.resolve(__dirname, '..', 'components'),
  path.resolve(__dirname, '..', 'modals'),
  path.resolve(__dirname, '..', 'pages'),
  path.resolve(__dirname, '..', 'contexts'),
  path.resolve(__dirname, '..', 'hooks'),
  path.resolve(__dirname, '..', '..', 'public')
]

async function findLinksInSource(file) {
  const source = await fs.readFile(file, { encoding: 'utf-8' })
  return source.match(/http(s)?:\/\/[^ <>\n'"${}]+/g)
}

async function getFilesRecursively(dir) {
  const dirents = await fs.readdir(dir, { withFileTypes: true })
  const files = await Promise.all(
    dirents.map((dirent) => {
      const res = path.resolve(dir, dirent.name)
      return dirent.isDirectory() ? getFilesRecursively(res) : res
    })
  )
  return Array.prototype.concat(...files)
}

const userAgent =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.54 Safari/537.36'
const httpClientOptions = {
  headers: { 'User-Agent': userAgent }
}

function request(link: string, callback) {
  const client = link.match(/^https:\/\//) ? https : http
  return client.get(link, httpClientOptions, callback)
}

it('has all valid links in the UI', async () => {
  const filesInDir = await Promise.all(pathsToUIRelatedCode.map((dir) => getFilesRecursively(dir)))
  const files = filesInDir.flatMap((x) => x)

  const linksFound = await Promise.all(files.map((file) => findLinksInSource(file)))
  const links = linksFound
    .flatMap((x) => x)
    .filter((link) => link !== null)
    .filter((link) => link.match(/localhost/) === null)
  const linksDedup = uniq(links)

  const sequencedPromises = linksDedup.reduce(
    (promise, link) =>
      promise.then(
        () =>
          new Promise((resolve, reject) =>
            request(link, ({ statusCode }) =>
              statusCode < 200 || statusCode >= 400 ? reject({ statusCode, link }) : resolve(link)
            ).on('error', (e) => reject({ e, link }))
          )
      ),
    Promise.resolve()
  )

  await sequencedPromises
}, 60000)
