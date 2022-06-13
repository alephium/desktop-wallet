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

import AddressSelect from '../../components/Inputs/AddressSelect'
import { Address } from '../../contexts/addresses'

export interface AddressSelectFromProps {
  addresses: Address[]
  defaultAddress: Address
  onChange: (v: Address) => void
}

const AddressSelectFrom = ({ addresses, defaultAddress, onChange }: AddressSelectFromProps) => {
  const updatedInitialAddress = addresses.find((a) => a.hash === defaultAddress.hash) ?? defaultAddress
  return (
    <AddressSelect
      label="From address"
      title="Select the address to send funds from."
      options={addresses}
      defaultAddress={updatedInitialAddress}
      onAddressChange={onChange}
      id="from-address"
      hideEmptyAvailableBalance
    />
  )
}

export default AddressSelectFrom
