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

import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import ActionLink from '@/components/ActionLink'
import AddressBadge from '@/components/AddressBadge'
import Box from '@/components/Box'
import HashEllipsed from '@/components/HashEllipsed'
import HorizontalDivider from '@/components/PageComponents/HorizontalDivider'
import { useAppSelector } from '@/hooks/redux'
import { selectContactByAddress } from '@/storage/addresses/addressesSelectors'
import { Address, AddressHash } from '@/types/addresses'
import { openInWebBrowser } from '@/utils/misc'

interface CheckAddressesBoxProps {
  fromAddress: Address
  toAddressHash?: AddressHash
  className?: string
}

const CheckAddressesBox = ({ fromAddress, toAddressHash, className }: CheckAddressesBoxProps) => {
  const { t } = useTranslation()
  const contact = useAppSelector((s) => selectContactByAddress(s, toAddressHash))
  const explorerUrl = useAppSelector((s) => s.network.settings.explorerUrl)

  return (
    <Box className={className}>
      <AddressRow>
        <AddressLabel>{t('From')}</AddressLabel>
        <AddressLabelHash>
          <AddressBadge addressHash={fromAddress.hash} truncate showHashWhenNoLabel />
          {fromAddress.label && <HashEllipsedStyled hash={fromAddress.hash} />}
        </AddressLabelHash>
      </AddressRow>
      {toAddressHash && (
        <>
          <HorizontalDivider />
          <AddressRow>
            <AddressLabel>{t('To')}</AddressLabel>
            <AddressLabelHash>
              {contact ? (
                <AddressLabelHash>
                  {contact.name}

                  <HashEllipsedStyled hash={contact.address} />
                </AddressLabelHash>
              ) : (
                <ActionLinkStyled onClick={() => openInWebBrowser(`${explorerUrl}/addresses/${toAddressHash}`)}>
                  <HashEllipsed hash={toAddressHash} />
                </ActionLinkStyled>
              )}
            </AddressLabelHash>
          </AddressRow>
        </>
      )}
    </Box>
  )
}

export default CheckAddressesBox

const AddressRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 18px 15px;
`

const AddressLabel = styled.div`
  font-weight: var(--fontWeight-semiBold);
  color: ${({ theme }) => theme.font.secondary};
`

const AddressLabelHash = styled.div`
  display: flex;
  gap: 10px;
`

const HashEllipsedStyled = styled(HashEllipsed)`
  max-width: 90px;
  color: ${({ theme }) => theme.font.tertiary};
`

const ActionLinkStyled = styled(ActionLink)`
  font-weight: var(--fontWeight-semiBold);
`
