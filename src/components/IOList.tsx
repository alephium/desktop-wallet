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

import { Input, Output } from '@alephium/sdk/dist/api/api-explorer'
import _ from 'lodash'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useAddressesContext } from '../contexts/addresses'
import useAddressLinkHandler from '../hooks/useAddressLinkHandler'
import ActionLink from './ActionLink'
import AddressBadge from './AddressBadge'
import Badge from './Badge'
import Truncate from './Truncate'

interface IOListProps {
  currentAddress: string
  isOut: boolean
  timestamp: number
  outputs?: Output[]
  inputs?: Input[]
  linkToExplorer?: boolean
  truncate?: boolean
}

const IOList = ({ currentAddress, isOut, outputs, inputs, timestamp, linkToExplorer, truncate }: IOListProps) => {
  const { t } = useTranslation('App')
  const { getAddress } = useAddressesContext()
  const handleShowAddress = useAddressLinkHandler()
  const io = (isOut ? outputs : inputs) as Array<Output | Input> | undefined
  const genesisTimestamp = 1231006505000

  if (io && io.length > 0) {
    const isAllCurrentAddress = io.every((o) => o.address === currentAddress)
    const notCurrentAddresses = _(io.filter((o) => o.address !== currentAddress))
      .map((v) => v.address)
      .uniq()
      .value()
    const address = isAllCurrentAddress ? currentAddress : notCurrentAddresses[0]
    const key = isAllCurrentAddress ? undefined : address
    const extraAddressesText = io.length > 1 ? `(+${io.length - 1})` : ''

    const addressWithMetadata = getAddress(address)
    const addressComponent = addressWithMetadata ? <AddressBadge address={addressWithMetadata} /> : address

    return truncate ? (
      <TruncateWrap>
        <AddressSpan>
          <Truncate key={key}>{addressComponent}</Truncate>
        </AddressSpan>
        {extraAddressesText && <AddressesHidden>{extraAddressesText}</AddressesHidden>}
      </TruncateWrap>
    ) : (
      <Addresses>
        {_(io)
          .map((o) => o.address)
          .uniq()
          .value()
          .map((address) => {
            const addressWithMetadata = getAddress(address)
            const addressComponent = addressWithMetadata ? <AddressBadge address={addressWithMetadata} /> : address

            return linkToExplorer ? (
              <ActionLink onClick={() => handleShowAddress(address)} key={address}>
                {addressComponent}
              </ActionLink>
            ) : (
              addressComponent
            )
          })}
      </Addresses>
    )
  } else if (timestamp === genesisTimestamp) {
    return <Badge truncate={truncate}>{t`Genesis TX`}</Badge>
  } else {
    return <Badge truncate={truncate}>{t`Mining Rewards`}</Badge>
  }
}

export default IOList

const TruncateWrap = styled.div`
  min-width: 0;
  display: flex;
  align-items: center;
  text-align: left;
`

const AddressesHidden = styled.div`
  margin-left: 0.5em;
  font-weight: var(--fontWeight-semiBold);
`

const Addresses = styled.div`
  display: flex;
  flex-direction: column;
  align-items: end;
`

const AddressSpan = styled.div`
  width: 30em;
  min-width: 4em;
`
