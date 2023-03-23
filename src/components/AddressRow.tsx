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

import styled from 'styled-components'

import AddressBadge from '@/components/AddressBadge'
import AddressColorIndicator from '@/components/AddressColorIndicator'
import { TableRow } from '@/components/Table'
import { Address } from '@/types/addresses'

interface AddressRowProps {
  address: Address
  disableAddressCopy?: boolean
  onClick?: (address: Address) => void
  className?: string
}

const AddressRow: FC<AddressRowProps> = ({ address, disableAddressCopy, onClick, children, className }) => (
  <TableRow
    key={address.hash}
    role="row"
    tabIndex={0}
    onClick={() => onClick && onClick(address)}
    onKeyPress={() => onClick && onClick(address)}
    className={className}
  >
    <Row>
      <AddressColorIndicator addressHash={address.hash} />
      <Label>
        <AddressBadge addressHash={address.hash} hideColorIndication truncate />
      </Label>
      {children}
    </Row>
  </TableRow>
)

export default AddressRow

const Row = styled.div`
  display: flex;
  align-items: center;
  flex-grow: 1;
  gap: 15px;
`

const Label = styled.div`
  font-size: 14px;
  font-weight: var(--fontWeight-semiBold);
  max-width: 200px;
  min-width: 0;
`
