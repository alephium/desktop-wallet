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

import { ComponentPropsWithoutRef, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { css } from 'styled-components'

import AddressColorIndicator from '@/components/AddressColorIndicator'
import Badge from '@/components/Badge'
import ClipboardButton from '@/components/Buttons/ClipboardButton'
import HashEllipsed from '@/components/HashEllipsed'
import { useAppSelector } from '@/hooks/redux'
import { makeSelectContactByAddress, selectAddressByHash } from '@/storage/addresses/addressesSelectors'
import { AddressHash } from '@/types/addresses'

type AddressBadgeProps = ComponentPropsWithoutRef<typeof Badge> & {
  addressHash: AddressHash
  truncate?: boolean
  withBorders?: boolean
  hideStar?: boolean
  hideColorIndication?: boolean
  disableA11y?: boolean
  disableCopy?: boolean
  showFull?: boolean
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
  const selectContactByAddress = useMemo(makeSelectContactByAddress, [])
  const contact = useAppSelector((s) => selectContactByAddress(s, addressHash))

  return contact ? (
    <div className={className}>
      <Label {...props}>
        {disableCopy ? (
          contact.name
        ) : (
          <ClipboardButton textToCopy={contact.address} tooltip={t('Copy contact address')} disableA11y={disableA11y}>
            {contact.name}
          </ClipboardButton>
        )}
      </Label>
    </div>
  ) : !address ? (
    <HashEllipsed className={className} hash={addressHash} disableCopy={disableCopy} />
  ) : (
    <div className={className}>
      {!hideColorIndication && <AddressColorIndicator addressHash={address.hash} hideStar={hideStar} />}
      {address.label ? (
        <Label {...props}>
          {disableCopy ? (
            address.label
          ) : (
            <ClipboardButton textToCopy={address.hash} tooltip={t('Copy address')} disableA11y={disableA11y}>
              {address.label}
            </ClipboardButton>
          )}
        </Label>
      ) : (
        <HashEllipsed hash={address.hash} disableA11y={disableA11y} disableCopy={disableCopy} />
      )}
    </div>
  )
}

export default styled(AddressBadge)`
  display: flex;
  align-items: center;
  gap: 4px;
  max-width: ${({ showFull }) => !showFull && 120}px;

  ${({ withBorders }) =>
    withBorders &&
    css`
      border: 1px solid ${({ theme }) => theme.border.primary};
      border-radius: 25px;
      padding: 5px 10px;
    `}

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
  white-space: nowrap;

  ${({ truncate }) =>
    truncate &&
    css`
      overflow: hidden;
      text-overflow: ellipsis;
    `}
`
