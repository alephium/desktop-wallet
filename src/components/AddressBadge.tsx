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

import { Address } from '../contexts/addresses'
import dotSvg from '../images/dot.svg'
import AddressEllipsed from './AddressEllipsed'
import Badge from './Badge'
import ClipboardButton from './Buttons/ClipboardButton'

type AddressBadgeProps = ComponentPropsWithoutRef<typeof Badge> & {
  address: Address
  truncate?: boolean
  showHashWhenNoLabel?: boolean
}

const AddressBadge = ({ address, showHashWhenNoLabel, className, ...props }: AddressBadgeProps) => {
  const { t } = useTranslation('App')

  if (!address) return null

  return showHashWhenNoLabel && !address.settings.label ? (
    <Hash className={className}>
      {address.settings.isMain && '★'}
      <AddressEllipsed addressHash={address.hash} />
    </Hash>
  ) : (
    <ClipboardButton textToCopy={address.hash} tipText={t`Copy address`}>
      <div className={className}>
        {address.settings.isMain && '★'} <Label {...props}>{address.getName()}</Label>
        {!!address.settings.label && <DotIcon color={address.settings.color} />}
      </div>
    </ClipboardButton>
  )
}

export default styled(AddressBadge)`
  display: flex;
  align-items: center;
  gap: 5px;

  ${({ truncate }) =>
    truncate &&
    css`
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    `}
`

const Label = styled.span<AddressBadgeProps>`
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

const DotIcon = styled.div<{ color?: string }>`
  display: inline-block;
  width: 7px;
  height: 8px;
  -webkit-mask: url(${dotSvg}) no-repeat 100% 100%;
  mask: url(${dotSvg}) no-repeat 100% 100%;
  -webkit-mask-size: cover;
  mask-size: cover;
  background-color: ${({ color, theme }) => color || theme.font.primary};
  flex-shrink: 0;
`

const Hash = styled.div`
  width: 100%;
`
