// Copyright 2018 - 2023 The Alephium Authors
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

const crypto = require('crypto')
const fs = require('fs')
const path = require('path')

function getFileChecksum(path) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256')

    fs.createReadStream(path)
      .on('error', reject)
      .on('data', (chunk) => hash.update(chunk))
      .on('close', () => resolve(hash.digest('hex')))
  })
}

exports.default = async function ({ artifactPaths }) {
  const checksums = []

  for (let i = 0; i < artifactPaths.length; i++) {
    const artifactPath = artifactPaths[i]

    if (!artifactPath.endsWith('.blockmap') && !artifactPath.endsWith('.snap') && !artifactPath.endsWith('.zip')) {
      const checksumFilePath = `${artifactPath}.checksum`
      const checksum = await getFileChecksum(artifactPath)

      fs.writeFileSync(checksumFilePath, `${checksum}  ${path.parse(artifactPath).base}`)

      checksums.push(checksumFilePath)
    }
  }

  return checksums
}
