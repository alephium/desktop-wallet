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
import styled, { useTheme } from 'styled-components'

import { Address } from '../contexts/addresses'
import { AddressSettings, isAddress, isAddressSettings } from '../utils/addresses'
import Badge from './Badge'
import ClipboardButton from './Buttons/ClipboardButton'

type AddressBadgeProps = ComponentPropsWithoutRef<typeof Badge> & {
  address: Address | AddressSettings
  truncate?: boolean
}

const AddressBadge = ({ address, className, ...props }: AddressBadgeProps) => {
  const theme = useTheme()

  let data
  let textToCopy

  if (isAddress(address)) {
    data = {
      color: address.settings.color,
      isMain: address.settings.isMain,
      label: address.getName()
    }
    textToCopy = address.hash
  } else if (isAddressSettings(address)) {
    data = address
    textToCopy = data.label
  } else {
    data = {
      color: theme.font.primary,
      isMain: false,
      label: ''
    }
    textToCopy = data.label
  }

  textToCopy = textToCopy ?? ''

  return (
    <ClipboardButton textToCopy={textToCopy}>
      <div className={className}>
        <Icon isMain={data.isMain} color={data.color} /> <Label {...props}>{data.label}</Label>
      </div>
    </ClipboardButton>
  )
}

export default styled(AddressBadge)`
  padding: 6px 0 6px 0;
  display: flex;

  ${({ truncate }) =>
    truncate &&
    `
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
  `}
`

const Label = styled.span<AddressBadgeProps>`
  ${({ truncate }) => truncate && 'overflow: hidden; text-overflow: ellipsis;'}
`

export const dotStyling = {
  width: '1rem',
  marginRight: '0.2rem'
}

const Icon = styled.span<{ isMain: boolean; color?: string }>`
  ${({ color, isMain, theme }) => `
    &::before {
      width: ${dotStyling.width};
      display: block;
      text-align: center;
      margin-right: ${dotStyling.marginRight};
      line-height: 1rem;
      font-size: ${isMain ? '1.4em' : '1em'};
      vertical-align: middle;
      content: '${isMain ? '★' : '●'}';
      border-radius: 100%;
      color: ${color ?? theme.font.primary};
    }
  `}
`
