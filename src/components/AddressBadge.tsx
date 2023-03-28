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

import { ComponentPropsWithoutRef } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { css } from 'styled-components'

import AddressColorIndicator from '@/components/AddressColorIndicator'
import Badge from '@/components/Badge'
import ClipboardButton from '@/components/Buttons/ClipboardButton'
import HashEllipsed from '@/components/HashEllipsed'
import { useAppSelector } from '@/hooks/redux'
import { selectAddressByHash, selectContactByAddress } from '@/storage/addresses/addressesSelectors'
import { AddressHash } from '@/types/addresses'

type AddressBadgeProps = ComponentPropsWithoutRef<typeof Badge> & {
  addressHash: AddressHash
  truncate?: boolean
  withBorders?: boolean
  hideStar?: boolean
  hideColorIndication?: boolean
  disableA11y?: boolean
  disableCopy?: boolean
}

const AddressBadge = ({
  addressHash,
  withBorders,
  hideStar,
  className,
  hideColorIndication,
  disableA11y = false,
  disableCopy,
  ...props
}: AddressBadgeProps) => {
  const { t } = useTranslation()
  const address = useAppSelector((s) => selectAddressByHash(s, addressHash))
  const contact = useAppSelector((s) => selectContactByAddress(s, addressHash))

  return !address ? (
    <HashEllipsed hash={addressHash} disableCopy={disableCopy} />
  ) : contact ? (
    <div className={className}>
      <Label {...props}>{contact.name}</Label>
    </div>
  ) : (
    <ClipboardButton textToCopy={address.hash} tooltip={t('Copy address')} disableA11y={disableA11y}>
      <RoundBorders className={className} withBorders={withBorders}>
        {!hideColorIndication && <AddressColorIndicator addressHash={address.hash} hideStar={hideStar} />}
        {address.label ? (
          <Label {...props}>{address.label}</Label>
        ) : (
          <HashEllipsed hash={address.hash} disableA11y={disableA11y} disableCopy={disableCopy} />
        )}
      </RoundBorders>
    </ClipboardButton>
  )
}

export default styled(AddressBadge)`
  display: flex;
  align-items: center;
  gap: 3px;

  ${({ truncate }) =>
    truncate &&
    css`
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    `}
`

const Label = styled.span<AddressBadgeProps>`
  margin-right: 2px;

  ${({ truncate }) =>
    truncate &&
    css`
      overflow: hidden;
      text-overflow: ellipsis;
    `}
`

const RoundBorders = styled.div<{ withBorders?: boolean }>`
  ${({ withBorders }) =>
    withBorders &&
    css`
      border: 1px solid ${({ theme }) => theme.border.primary};
      border-radius: 25px;
      padding: 5px 10px;
    `}
`
