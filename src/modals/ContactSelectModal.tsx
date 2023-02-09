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

import { SearchIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import AddressEllipsed from '@/components/AddressEllipsed'
import Button from '@/components/Button'
import InfoBox from '@/components/InfoBox'
import Input from '@/components/Inputs/Input'
import Option from '@/components/Inputs/Option'
import Scrollbar from '@/components/Scrollbar'
import Truncate from '@/components/Truncate'
import { useAppSelector } from '@/hooks/redux'
import CenteredModal, { ModalFooterButton, ModalFooterButtons } from '@/modals/CenteredModal'
import { selectAllContacts } from '@/storage/app-state/slices/contactsSlice'
import { Contact } from '@/types/contacts'
import { filterContacts } from '@/utils/contacts'

import ContactFormModal from './ContactFormModal'
import ModalPortal from './ModalPortal'

interface ContactSelectModalProps {
  setContact: (contact: Contact) => void | undefined
  onClose: () => void
}

const ContactSelectModal = ({ setContact, onClose }: ContactSelectModalProps) => {
  const { t } = useTranslation()
  const contacts = useAppSelector(selectAllContacts)

  const [selectedContact, setSelectedContact] = useState<Contact>()
  const [isContactFormModalOpen, setIsContactFormModalOpen] = useState(false)
  const [filteredContacts, setFilteredContacts] = useState(contacts)
  const [searchInput, setSearchInput] = useState('')

  useEffect(() => {
    setFilteredContacts(filterContacts(contacts, searchInput.toLowerCase()))
  }, [contacts, searchInput])

  const onOptionContactSelect = (contact: Contact) => {
    setContact(contact)
    onClose()
  }

  return (
    <CenteredModal title={t('Contacts')} onClose={onClose}>
      <Header>
        <Searchbar
          placeholder={t('Search for name or a hash...')}
          Icon={SearchIcon}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <HeaderButton role="secondary" short onClick={() => setIsContactFormModalOpen(true)}>
          + {t('New contact')}
        </HeaderButton>
      </Header>
      <ContactsList>
        <Scrollbar translateContentSizeYToHolder>
          {filteredContacts.map((contact) => (
            <Option
              key={contact.id}
              onSelect={() => setSelectedContact(contact)}
              isSelected={selectedContact?.id === contact.id}
            >
              <Name>{contact.name}</Name>
              <AddressEllipsedStyled addressHash={contact.address} />
            </Option>
          ))}
          {contacts.length === 0 && (
            <InfoBox importance="accent" text={t('Create contacts to avoid mistakes when sending transactions!')} />
          )}
        </Scrollbar>
      </ContactsList>

      <ModalFooterButtons>
        <ModalFooterButton role="secondary" onClick={onClose}>
          {t('Cancel')}
        </ModalFooterButton>
        <ModalFooterButton
          onClick={() => selectedContact && onOptionContactSelect(selectedContact)}
          disabled={!selectedContact}
        >
          {t('Select')}
        </ModalFooterButton>
      </ModalFooterButtons>
      <ModalPortal>
        {isContactFormModalOpen && <ContactFormModal onClose={() => setIsContactFormModalOpen(false)} />}
      </ModalPortal>
    </CenteredModal>
  )
}

export default ContactSelectModal

const AddressEllipsedStyled = styled(AddressEllipsed)`
  margin-left: auto;
  color: ${({ theme }) => theme.font.secondary};
`

const Name = styled(Truncate)`
  font-weight: var(--fontWeight-semiBold);
`

const ContactsList = styled.div`
  display: flex;
  flex-direction: column;
  max-height: 60vh;
  border: 1px solid ${({ theme }) => theme.border.secondary};
  border-radius: var(--radius);
  overflow: hidden;
`

const Header = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: var(--spacing-5);
  justify-content: space-between;
`

const HeaderButton = styled(Button)`
  margin: 0;
`

const Searchbar = styled(Input)`
  max-width: 364px;
  margin: 0;

  svg {
    color: ${({ theme }) => theme.font.tertiary};
  }
`
