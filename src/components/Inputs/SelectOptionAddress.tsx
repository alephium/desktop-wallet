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

import styled from 'styled-components'

import AddressBadge from '@/components/AddressBadge'
import Amount from '@/components/Amount'
import SelectOptionItemContent from '@/components/Inputs/SelectOptionItemContent'
import { Address } from '@/types/addresses'

interface SelectOptionAddressProps {
  address: Address
  isSelected?: boolean
  className?: string
}

const SelectOptionAddress = ({ address, isSelected, className }: SelectOptionAddressProps) => (
  <SelectOptionItemContent
    className={className}
    MainContent={<AddressBadgeStyled addressHash={address.hash} disableA11y withBorders />}
    SecondaryContent={
      <AmountStyled
        value={BigInt(address.balance)}
        color={isSelected ? 'var(--color-white)' : undefined}
        overrideSuffixColor
      />
    }
  />
)

export default SelectOptionAddress

const AddressBadgeStyled = styled(AddressBadge)`
  width: auto;
`

const AmountStyled = styled(Amount)`
  flex: 1;
  font-weight: var(--fontWeight-semiBold);
`
