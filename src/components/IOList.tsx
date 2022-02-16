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

import { Input, Output } from 'alephium-js/dist/api/api-explorer'
import _ from 'lodash'

import { AddressHash } from '../contexts/addresses'
import { useGlobalContext } from '../contexts/global'
import { openInWebBrowser } from '../utils/misc'
import ActionLink from './ActionLink'
import TransactionBadge from './TransactionBadge'

interface IOListProps {
  currentAddress: string
  isOut: boolean
  timestamp: number
  outputs?: Output[]
  inputs?: Input[]
  linkToExplorer?: boolean
}

const IOList = ({ currentAddress, isOut, outputs, inputs, timestamp, linkToExplorer }: IOListProps) => {
  const {
    settings: {
      network: { explorerUrl }
    }
  } = useGlobalContext()
  const io = (isOut ? outputs : inputs) as Array<Output | Input> | undefined
  const genesisTimestamp = 1231006505000

  const handleShowAddressInExplorer = (address: AddressHash) => {
    openInWebBrowser(`${explorerUrl}/#/addresses/${address}`)
  }

  if (io && io.length > 0) {
    return io.every((o) => o.address === currentAddress) ? (
      linkToExplorer ? (
        <ActionLink onClick={() => handleShowAddressInExplorer(currentAddress)}>{currentAddress}</ActionLink>
      ) : (
        <span>{currentAddress}</span>
      )
    ) : (
      <>
        {_(io.filter((o) => o.address !== currentAddress))
          .map((v) => v.address)
          .uniq()
          .value()
          .map((address) =>
            linkToExplorer ? (
              <ActionLink onClick={() => handleShowAddressInExplorer(address)} key={address}>
                {address}
              </ActionLink>
            ) : (
              <span key={address}>{address}</span>
            )
          )}
      </>
    )
  } else if (timestamp === genesisTimestamp) {
    return <TransactionBadge type="neutral" content="Genesis TX" />
  } else {
    return <TransactionBadge type="neutral" content="Mining Rewards" />
  }
}

export default IOList
