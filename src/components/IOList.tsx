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
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import ActionLink from '@/components/ActionLink'
import AddressBadge from '@/components/AddressBadge'
import Badge from '@/components/Badge'
import { useAppSelector } from '@/hooks/redux'
import AddressDetailsModal from '@/modals/AddressDetailsModal'
import ModalPortal from '@/modals/ModalPortal'
import { selectAddressIds } from '@/storage/app-state/slices/addressesSlice'
import { AddressHash } from '@/types/addresses'
import { GENESIS_TIMESTAMP } from '@/utils/constants'
import { openInWebBrowser } from '@/utils/misc'

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
  const { t } = useTranslation()
  const internalAddressHashes = useAppSelector(selectAddressIds) as AddressHash[]
  const { explorerUrl } = useAppSelector((state) => state.network.settings)

  const [selectedAddressHash, setSelectedAddressHash] = useState<AddressHash>()

  const io = (isOut ? outputs : inputs) as Array<Output | Input> | undefined

  const handleShowAddress = (addressHash: AddressHash) =>
    internalAddressHashes.includes(addressHash)
      ? setSelectedAddressHash(addressHash)
      : openInWebBrowser(`${explorerUrl}/addresses/${addressHash}`)

  if (io && io.length > 0) {
    const isAllCurrentAddress = io.every((o) => o.address === currentAddress)
    const notCurrentAddresses = _(io.filter((o) => o.address !== currentAddress))
      .map((v) => v.address)
      .filter((v): v is string => v !== undefined)
      .uniq()
      .value()

    const addressHash = isAllCurrentAddress ? currentAddress : notCurrentAddresses[0]
    if (!addressHash) return null

    const extraAddressesText = notCurrentAddresses.length > 1 ? `(+${notCurrentAddresses.length - 1})` : ''

    // There may be a case where a wallet sends funds to the same address, which doesn't
    // make it a change address but a legimitate receiving address.
    const addressesToShow = notCurrentAddresses.length === 0 ? [currentAddress] : notCurrentAddresses

    return truncate ? (
      <TruncateWrap>
        <AddressBadge truncate addressHash={addressHash} showHashWhenNoLabel withBorders disableA11y={disableA11y} />
        {extraAddressesText && <AddressesHidden>{extraAddressesText}</AddressesHidden>}
      </TruncateWrap>
    ) : (
      <Addresses>
        {addressesToShow.map((addressHash) => {
          const addressComponent = (
            <AddressBadge
              truncate
              addressHash={addressHash}
              showHashWhenNoLabel
              withBorders
              disableA11y={disableA11y}
            />
          )
          return linkToExplorer ? (
            <ActionLinkStyled onClick={() => handleShowAddress(addressHash)} key={addressHash}>
              {addressComponent}
            </ActionLinkStyled>
          ) : (
            addressComponent
          )
        })}
        <ModalPortal>
          {selectedAddressHash && (
            <AddressDetailsModal addressHash={selectedAddressHash} onClose={() => setSelectedAddressHash(undefined)} />
          )}
        </ModalPortal>
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
