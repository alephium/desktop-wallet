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

import { motion } from 'framer-motion'
import { Contact as ContactIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import AddressEllipsed from '@/components/AddressEllipsed'
import Badge from '@/components/Badge'
import { InputProps, inputStyling } from '@/components/Inputs'
import Input from '@/components/Inputs/Input'
import { useAppSelector } from '@/hooks/redux'
import { selectAllContacts } from '@/storage/app-state/slices/contactsSlice'
import { Contact } from '@/types/contacts'

import ContactSelectModal from '../ContactSelectModal'
import ModalPortal from '../ModalPortal'

interface AddressSelectToProps extends InputProps {
  onContactSelect: (address: string) => void
}

type InputFieldMode = 'view' | 'edit'

const AddressSelectTo = ({ label, onContactSelect, value, ...props }: AddressSelectToProps) => {
  const { t } = useTranslation()
  const contacts = useAppSelector(selectAllContacts)
  const inputRef = useRef<HTMLInputElement>(null)

  const [isAddressSelectModalOpen, setIsAddressSelectModalOpen] = useState(false)
  const [contact, setContact] = useState<Contact>()
  const [inputFieldMode, setInputFieldMode] = useState<InputFieldMode>('view')

  const isContactVisible = contact && inputFieldMode === 'view'

  useEffect(() => {
    const existingContact = contacts.find((c) => c.address === value)

    setContact(existingContact)
  }, [contacts, value])

  const handleContactSelect = (c: Contact) => onContactSelect(c.address)

  const handleFocus = () => {
    inputRef.current?.focus()
    setInputFieldMode('edit')
  }

  return (
    <>
      <Input
        label={label ?? t("Recipient's address")}
        inputFieldRef={inputRef}
        value={value}
        {...props}
        onFocus={handleFocus}
        onBlur={() => setInputFieldMode('view')}
        inputFieldStyle={{
          paddingRight: '48px',
          color: isContactVisible ? 'transparent' : undefined,
          transition: 'all 0.2s ease-out'
        }}
      >
        <ContactIconStyled onClick={() => setIsAddressSelectModalOpen(true)} />
        {isContactVisible && (
          <ContactRow onClick={handleFocus}>
            <Badge rounded transparent border truncate>
              {contact.name}
            </Badge>
            <AddressEllipsed addressHash={contact.address} disableA11y />
          </ContactRow>
        )}
      </Input>
      <ModalPortal>
        {isAddressSelectModalOpen && (
          <ContactSelectModal setContact={handleContactSelect} onClose={() => setIsAddressSelectModalOpen(false)} />
        )}
      </ModalPortal>
    </>
  )
}

export default AddressSelectTo

const ContactIconStyled = styled(ContactIcon)`
  color: ${({ theme }) => theme.font.secondary};
  transition: color 0.2s ease-out;
  cursor: pointer;
  position: absolute;
  right: ${inputStyling.paddingLeftRight};
  height: 100%;

  &:hover {
    color: ${({ theme }) => theme.font.primary};
  }
`

const ContactRow = styled(motion.div)`
  display: flex;
  gap: var(--spacing-2);
  position: absolute;
  width: 90%;
  height: 100%;
  align-items: center;
  top: 6px;
  left: ${inputStyling.paddingLeftRight};
  transition: opacity 0.2s ease-out;
`
