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

import { AddressHash, useAddressesContext } from '@/contexts/addresses'
import useAddressLinkHandler from '@/hooks/useAddressLinkHandler'
import { GENESIS_TIMESTAMP } from '@/utils/constants'

import ActionLink from './ActionLink'
import AddressBadge from './AddressBadge'
import AddressEllipsed from './AddressEllipsed'
import Badge from './Badge'

interface IOListProps {
  currentAddress: string
  isOut: boolean
  timestamp: number
  outputs?: Output[]
  inputs?: Input[]
  linkToExplorer?: boolean
  truncate?: boolean
  disableA11y?: boolean
}

const IOList = ({
  currentAddress,
  isOut,
  outputs,
  inputs,
  timestamp,
  linkToExplorer,
  truncate,
  disableA11y = false
}: IOListProps) => {
  const { t } = useTranslation('App')
  const { getAddress } = useAddressesContext()
  const handleShowAddress = useAddressLinkHandler()
  const io = (isOut ? outputs : inputs) as Array<Output | Input> | undefined

  if (io && io.length > 0) {
    const isAllCurrentAddress = io.every((o) => o.address === currentAddress)
    const notCurrentAddresses = _(io.filter((o) => o.address !== currentAddress))
      .map((v) => v.address)
      .uniq()
      .value()

    const addressHash = isAllCurrentAddress ? currentAddress : notCurrentAddresses[0]
    if (!addressHash) return null

    const extraAddressesText = notCurrentAddresses.length > 1 ? `(+${notCurrentAddresses.length - 1})` : ''

    // There may be a case where a wallet sends funds to the same address, which doesn't
    // make it a change address but a legimitate receiving address.
    const addressesToShow = notCurrentAddresses.length === 0 ? [currentAddress] : notCurrentAddresses

    const getAddressComponent = (addressHash: AddressHash) => {
      const address = getAddress(addressHash)

      return address ? (
        <AddressBadge truncate address={address} showHashWhenNoLabel withBorders disableA11y={disableA11y} />
      ) : (
        <AddressEllipsed addressHash={addressHash} disableA11y={disableA11y} />
      )
    }

    return truncate ? (
      <TruncateWrap>
        {getAddressComponent(addressHash)}
        {extraAddressesText && <AddressesHidden>{extraAddressesText}</AddressesHidden>}
      </TruncateWrap>
    ) : (
      <Addresses>
        {addressesToShow.map((addressHash) => {
          if (!addressHash) return null

          const addressComponent = getAddressComponent(addressHash)
          return linkToExplorer ? (
            <ActionLinkStyled onClick={() => handleShowAddress(addressHash)} key={addressHash}>
              {addressComponent}
            </ActionLinkStyled>
          ) : (
            addressComponent
          )
        })}
      </Addresses>
    )
  } else if (timestamp === GENESIS_TIMESTAMP) {
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
  color: ${({ theme }) => theme.font.secondary};
`

const Addresses = styled.div`
  display: flex;
  flex-direction: column;
  align-items: end;
  overflow: hidden;
`

const ActionLinkStyled = styled(ActionLink)`
  width: 100%;
  justify-content: flex-end;
`
