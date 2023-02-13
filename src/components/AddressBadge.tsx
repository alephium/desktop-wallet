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

import AddressEllipsed from '@/components/AddressEllipsed'
import Badge from '@/components/Badge'
import ClipboardButton from '@/components/Buttons/ClipboardButton'
import DotIcon from '@/components/DotIcon'
import { useAppSelector } from '@/hooks/redux'
import { selectAddressByHash } from '@/storage/app-state/slices/addressesSlice'
import { AddressHash } from '@/types/addresses'
import { getName } from '@/utils/addresses'

type AddressBadgeProps = ComponentPropsWithoutRef<typeof Badge> & {
  addressHash: AddressHash
  truncate?: boolean
  showHashWhenNoLabel?: boolean
  withBorders?: boolean
  hideStar?: boolean
  disableA11y?: boolean
}

const AddressBadge = ({
  addressHash,
  showHashWhenNoLabel,
  withBorders,
  hideStar,
  className,
  disableA11y = false,
  ...props
}: AddressBadgeProps) => {
  const { t } = useTranslation()
  const address = useAppSelector((state) => selectAddressByHash(state, addressHash))
  const isPassphraseUsed = useAppSelector((state) => state.activeWallet.isPassphraseUsed)

  if (!address) return <AddressEllipsed addressHash={addressHash} />

  return showHashWhenNoLabel && !address.label ? (
    <Hash className={className}>
      {!isPassphraseUsed && address.isDefault && !hideStar && <Star>★</Star>}
      <AddressEllipsed addressHash={address.hash} disableA11y={disableA11y} />
    </Hash>
  ) : (
    <ClipboardButton textToCopy={address.hash} tooltip={t`Copy address`} disableA11y={disableA11y}>
      <RoundBorders className={className} withBorders={withBorders}>
        {!isPassphraseUsed && address.isDefault && !hideStar && <Star>★</Star>}
        <Label {...props}>{getName(address)}</Label>
        {!!address.label && <DotIcon color={address.color} />}
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

export const dotStyling = {
  width: '1rem',
  marginRight: '0.2rem'
}

const Hash = styled.div`
  width: 100%;
`

const Star = styled.span`
  opacity: 0.6;
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
