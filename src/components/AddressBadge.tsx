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
import styled from 'styled-components'

import { Address } from '../contexts/addresses'
import { AddressSettings } from '../utils/addresses'
import Badge from './Badge'

type AddressBadgeProps = ComponentPropsWithoutRef<typeof Badge> & {
  address: Address | AddressSettings
  truncate?: boolean
}

const AddressBadge = ({ address, className, ...props }: AddressBadgeProps) => {
  let data

  if ((address as Address)?.settings) {
    data = {
      color: (address as Address).settings.color,
      isMain: (address as Address).settings.isMain,
      label: (address as Address).getName()
    }
  } else if (address as AddressSettings) {
    data = address as AddressSettings
  } else {
    data = {
      color: 'white',
      isMain: false,
      label: ''
    }
  }

  return (
    <Container className={className} {...props}>
      <Icon isMain={data.isMain} color={data.color} /> <Label {...props}>{data.label}</Label>
    </Container>
  )
}

export default AddressBadge

const Label = styled.span<AddressBadgeProps>`
  ${({ truncate }) => truncate && 'overflow: hidden; text-overflow: ellipsis;'}
`

const Icon = styled.span<AddressBadgeProps>`
  &::before {
    width: 1rem;
    display: block;
    text-align: center;
    margin-right: 0.2rem;
    line-height: 1rem;
    font-size: ${({ isMain }) => (isMain ? '1.4em' : '1em')};
    vertical-align: middle;
    content: '${({ isMain }) => (isMain ? '★' : '●')}';
    border-radius: 100%;
    color: ${({ color }) => color};
  }
`

const Container = styled.div<AddressBadgeProps>`
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
