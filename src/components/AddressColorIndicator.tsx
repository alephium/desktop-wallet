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

import DotIcon from '@/components/DotIcon'
import { useAppSelector } from '@/hooks/redux'
import { selectAddressByHash } from '@/storage/addresses/addressesSelectors'
import { AddressHash } from '@/types/addresses'

interface AddressColorIndicatorProps {
  addressHash: AddressHash
  className?: string
  hideStar?: boolean
}

const AddressColorIndicator = ({ addressHash, hideStar, className }: AddressColorIndicatorProps) => {
  const address = useAppSelector((s) => selectAddressByHash(s, addressHash))
  const isPassphraseUsed = useAppSelector((s) => s.activeWallet.isPassphraseUsed)

  if (!address) return null

  return (
    <div className={className}>
      {address.isDefault && !isPassphraseUsed && !hideStar ? (
        <Star color={address.color}>★</Star>
      ) : (
        <DotIcon size={11} color={address.color} />
      )}
    </div>
  )
}

export default styled(AddressColorIndicator)`
  width: 18px;
  display: flex;
  justify-content: center;
  flex-shrink: 0;
`

const Star = styled.div<{ color: string }>`
  color: ${({ color }) => color};
  font-size: 18px;
`
