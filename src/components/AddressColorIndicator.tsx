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

import DotIcon from '@/components/DotIcon'
import { useAppSelector } from '@/hooks/redux'
import { ReactComponent as MainAddressBadgeBackground } from '@/images/main_address_badge.svg'
import { selectAddressByHash } from '@/storage/addresses/addressesSelectors'
import { AddressHash } from '@/types/addresses'

interface AddressColorIndicatorProps {
  addressHash: AddressHash
  hideMainAddressBadge?: boolean
  size?: number
  className?: string
}

const AddressColorIndicator = ({
  addressHash,
  hideMainAddressBadge,
  size = 12,
  className
}: AddressColorIndicatorProps) => {
  const address = useAppSelector((s) => selectAddressByHash(s, addressHash))
  const isPassphraseUsed = useAppSelector((s) => s.activeWallet.isPassphraseUsed)

  if (!address) return null

  return (
    <div className={className}>
      {address.isDefault && !isPassphraseUsed && !hideMainAddressBadge ? (
        <MainAddressBadge color={address.color} size={size}>
          <MainAddressBadgeBackground />
        </MainAddressBadge>
      ) : (
        <DotIcon size={size} color={address.color} />
      )}
    </div>
  )
}

export default styled(AddressColorIndicator)`
  display: flex;
  justify-content: center;
  flex-shrink: 0;
`

const MainAddressBadge = styled.div<{ color: string; size: number }>`
  position: relative;
  width: ${({ size }) => size + 2}px;
  height: ${({ size }) => size + 2}px;

  svg * {
    fill: ${({ color }) => color} !important;
  }
`
