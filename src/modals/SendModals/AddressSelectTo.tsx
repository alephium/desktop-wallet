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

import { AnimatePresence } from 'framer-motion'
import { Contact as ContactIcon } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { InputProps, inputStyling } from '@/components/Inputs'
import Input from '@/components/Inputs/Input'
import { Contact } from '@/types/contacts'

import ContactSelectModal from '../ContactSelectModal'

interface AddressSelectToProps extends InputProps {
  onContactSelect: (address: string) => void
}

const AddressSelectTo = ({ label, onContactSelect, ...props }: AddressSelectToProps) => {
  const { t } = useTranslation()

  const [isAddressSelectModalOpen, setIsAddressSelectModalOpen] = useState(false)

  const selectContact = (contact: Contact) => {
    onContactSelect(contact.address)
  }

  return (
    <>
      <Input label={label ?? t("Recipient's address")} inputFieldStyle={{ paddingRight: '48px' }} {...props}>
        <ContactIconStyled onClick={() => setIsAddressSelectModalOpen(true)} />
      </Input>
      <AnimatePresence>
        {isAddressSelectModalOpen && (
          <ContactSelectModal setContact={selectContact} onClose={() => setIsAddressSelectModalOpen(false)} />
        )}
      </AnimatePresence>
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
