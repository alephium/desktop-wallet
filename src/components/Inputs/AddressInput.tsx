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

import { motion } from 'framer-motion'
import { useRef, useState } from 'react'
import styled from 'styled-components'

import AddressBadge from '@/components/AddressBadge'
import HashEllipsed from '@/components/HashEllipsed'
import { InputProps, inputStyling } from '@/components/Inputs'
import Input from '@/components/Inputs/Input'
import Truncate from '@/components/Truncate'
import { useAppSelector } from '@/hooks/redux'
import { selectAddressByHash, selectAllContacts } from '@/storage/addresses/addressesSelectors'

type InputFieldMode = 'view' | 'edit'

const AddressInput = ({ value, ...props }: InputProps) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [inputFieldMode, setInputFieldMode] = useState<InputFieldMode>('view')

  const cleanedValue = value?.toString() || ''

  const ownAddress = useAppSelector((s) => selectAddressByHash(s, cleanedValue))
  const contact = useAppSelector((s) => selectAllContacts(s)).find((c) => c.address === cleanedValue)

  const isContactVisible = contact && inputFieldMode === 'view'
  const isOwnAddressVisible = ownAddress && inputFieldMode === 'view'

  const handleFocus = () => {
    inputRef.current?.focus()
    setInputFieldMode('edit')
  }

  return (
    <Input
      value={ownAddress ? ownAddress.hash : contact ? contact.address : value}
      inputFieldRef={inputRef}
      onFocus={handleFocus}
      onBlur={() => setInputFieldMode('view')}
      inputFieldStyle={{
        color: isContactVisible || isOwnAddressVisible ? 'transparent' : undefined,
        transition: 'all 0.2s ease-out'
      }}
      largeText
      {...props}
    >
      {isContactVisible && (
        <InputStaticOverlay onClick={handleFocus}>
          <Truncate>{contact.name}</Truncate>
          <HashEllipsedStyled hash={contact.address} disableA11y />
        </InputStaticOverlay>
      )}
      {isOwnAddressVisible && (
        <InputStaticOverlay>
          <AddressBadge addressHash={ownAddress.hash} />
        </InputStaticOverlay>
      )}
    </Input>
  )
}

export default AddressInput

const InputStaticOverlay = styled(motion.div)`
  display: flex;
  gap: var(--spacing-2);
  position: absolute;
  height: 100%;
  align-items: center;
  top: 0;
  left: ${inputStyling.paddingLeftRight};
  right: ${inputStyling.paddingLeftRight};
  transition: opacity 0.2s ease-out;
  pointer-events: none;
`

const HashEllipsedStyled = styled(HashEllipsed)`
  margin-left: auto;
  color: ${({ theme }) => theme.font.secondary};
  max-width: 150px;
`
