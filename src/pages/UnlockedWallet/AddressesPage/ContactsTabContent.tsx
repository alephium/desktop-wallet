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

import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUp, Pencil } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { fadeIn } from '@/animations'
import AddressEllipsed from '@/components/AddressEllipsed'
import Button from '@/components/Button'
import Card from '@/components/Card'
import Truncate from '@/components/Truncate'
import { useAppSelector } from '@/hooks/redux'
import ContactFormModal from '@/modals/ContactFormModal'
import SendModalTransfer from '@/modals/SendModals/SendModalTransfer'
import { selectAllContacts } from '@/store/contactsSlice'
import { Contact } from '@/types/contacts'
import { filterContacts } from '@/utils/contacts'

import TabContent from './TabContent'

const ContactsTabContent = () => {
  const { t } = useTranslation()
  const contacts = useAppSelector(selectAllContacts)

  const [filteredContacts, setFilteredContacts] = useState(contacts)
  const [searchInput, setSearchInput] = useState('')
  const [isSendModalOpen, setIsSendModalOpen] = useState(false)
  const [isContactFormModalOpen, setIsContactFormModalOpen] = useState(false)
  const [selectedContact, setSelectedContact] = useState<Contact>()

  useEffect(() => {
    setFilteredContacts(filterContacts(contacts, searchInput.toLowerCase()))
  }, [contacts, searchInput])

  const openSendModal = (contact: Contact) => {
    setSelectedContact(contact)
    setIsSendModalOpen(true)
  }

  const closeSendModal = () => {
    setSelectedContact(undefined)
    setIsSendModalOpen(false)
  }

  const openEditContactModal = (contact: Contact) => {
    setSelectedContact(contact)
    setIsContactFormModalOpen(true)
  }

  const closeContactFormModal = () => {
    setSelectedContact(undefined)
    setIsContactFormModalOpen(false)
  }

  return (
    <motion.div {...fadeIn}>
      <TabContent
        searchPlaceholder={t('Search for name or a hash...')}
        onSearch={setSearchInput}
        buttonText={`+ ${t('New contact')}`}
        onButtonClick={() => setIsContactFormModalOpen(true)}
        newItemPlaceholderText={t('Create contacts to avoid mistakes when sending transactions!')}
      >
        {filteredContacts.map((contact) => (
          <Card key={contact.address}>
            <ContentRow>
              <Name>{contact.name}</Name>
              <AddressEllipsedStyled addressHash={contact.address} />
            </ContentRow>
            <ButtonsRow>
              <SendButton transparent borderless onClick={() => openSendModal(contact)}>
                <ArrowUp strokeWidth={1} />
                <ButtonText>{t('Send')}</ButtonText>
              </SendButton>
              <Separator />
              <EditButton transparent borderless onClick={() => openEditContactModal(contact)}>
                <Pencil strokeWidth={1} />
                <ButtonText>{t('Edit')}</ButtonText>
              </EditButton>
            </ButtonsRow>
          </Card>
        ))}
        <AnimatePresence>
          {isContactFormModalOpen && <ContactFormModal contact={selectedContact} onClose={closeContactFormModal} />}
          {isSendModalOpen && (
            <SendModalTransfer initialTxData={{ toAddress: selectedContact?.address }} onClose={closeSendModal} />
          )}
        </AnimatePresence>
      </TabContent>
    </motion.div>
  )
}

export default ContactsTabContent

const ContentRow = styled.div`
  padding: 60px 26px 30px;
  text-align: center;
`

const Name = styled(Truncate)`
  font-size: 18px;
  font-weight: var(--fontWeight-semiBold);
  margin-bottom: 20px;
`

const ButtonsRow = styled.div`
  display: flex;
`

const AddressEllipsedStyled = styled(AddressEllipsed)`
  font-size: 16px;
  font-weight: var(--fontWeight-medium);
`

const BottomButton = styled(Button)`
  border-top: 1px solid ${({ theme }) => theme.border.secondary};
  border-radius: 0;
  height: 85px;
  margin: 0;
  flex-direction: column;
`

const SendButton = styled(BottomButton)`
  border-bottom-left-radius: var(--radius-huge);
`
const EditButton = styled(BottomButton)`
  border-bottom-right-radius: var(--radius-huge);
`

const ButtonText = styled.div`
  font-size: 12px;
  margin-top: 10px;
`

const Separator = styled.div`
  width: 1px;
  background-color: ${({ theme }) => theme.border.secondary};
`
