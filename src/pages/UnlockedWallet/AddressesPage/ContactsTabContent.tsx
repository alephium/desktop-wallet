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

import { colord } from 'colord'
import { motion } from 'framer-motion'
import { ArrowUp, Pencil } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { fadeIn } from '@/animations'
import Box from '@/components/Box'
import Button from '@/components/Button'
import Card from '@/components/Card'
import HashEllipsed from '@/components/HashEllipsed'
import Truncate from '@/components/Truncate'
import { useAppSelector } from '@/hooks/redux'
import ContactFormModal from '@/modals/ContactFormModal'
import ModalPortal from '@/modals/ModalPortal'
import SendModalTransfer from '@/modals/SendModals/Transfer'
import TabContent from '@/pages/UnlockedWallet/AddressesPage/TabContent'
import { selectAllContacts, selectDefaultAddress } from '@/storage/addresses/addressesSelectors'
import { Contact } from '@/types/contacts'
import { stringToColour } from '@/utils/colors'
import { filterContacts } from '@/utils/contacts'
import { getInitials } from '@/utils/misc'

const ContactsTabContent = () => {
  const { t } = useTranslation()
  const contacts = useAppSelector(selectAllContacts)
  const defaultAddress = useAppSelector(selectDefaultAddress)

  const [filteredContacts, setFilteredContacts] = useState(contacts)
  const [searchInput, setSearchInput] = useState('')
  const [isSendModalOpen, setIsSendModalOpen] = useState(false)
  const [isContactFormModalOpen, setIsContactFormModalOpen] = useState(false)
  const [selectedContact, setSelectedContact] = useState<Contact>()

  const newContactButtonText = `+ ${t('New contact')}`

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

  const openContactFormModal = () => setIsContactFormModalOpen(true)

  return (
    <motion.div {...fadeIn}>
      <TabContent
        searchPlaceholder={t('Search for name or a hash...')}
        onSearch={setSearchInput}
        buttonText={newContactButtonText}
        onButtonClick={openContactFormModal}
      >
        <ContactBox>
          {filteredContacts.map((contact) => (
            <Card key={contact.address}>
              <ContentRow>
                <Initials color={stringToColour(contact.address)}>{getInitials(contact.name)}</Initials>
                <Name>{contact.name}</Name>
                <HashEllipsedStyled hash={contact.address} />
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
          {contacts.length === 0 && (
            <PlaceholderCard layout isPlaceholder>
              <Text>{t('Create contacts to avoid mistakes when sending transactions!')}</Text>
              <motion.div>
                <Button role="secondary" short onClick={openContactFormModal}>
                  {newContactButtonText}
                </Button>
              </motion.div>
            </PlaceholderCard>
          )}
        </ContactBox>
        <ModalPortal>
          {isContactFormModalOpen && <ContactFormModal contact={selectedContact} onClose={closeContactFormModal} />}
          {isSendModalOpen && defaultAddress && (
            <SendModalTransfer
              initialTxData={{ fromAddress: defaultAddress, toAddress: selectedContact?.address }}
              onClose={closeSendModal}
            />
          )}
        </ModalPortal>
      </TabContent>
    </motion.div>
  )
}

export default ContactsTabContent

const ContentRow = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--spacing-4);
  gap: 20px;
  text-align: center;
`

const Initials = styled.div<{ color: string }>`
  display: flex;
  height: 80px;
  width: 80px;
  font-size: 16px;
  background-color: ${({ color }) => colord(color).alpha(0.08).toHex()};
  border: 1px solid ${({ color }) => colord(color).alpha(0.2).toHex()};
  color: ${({ color }) => colord(color).alpha(0.8).toHex()};
  border-radius: var(--radius-full);
  align-items: center;
  justify-content: center;
`

const Name = styled(Truncate)`
  font-size: 18px;
  font-weight: var(--fontWeight-semiBold);
`

const ButtonsRow = styled.div`
  display: flex;
`

const HashEllipsedStyled = styled(HashEllipsed)`
  font-size: 16px;
  font-weight: var(--fontWeight-medium);
  width: 65%;
  color: ${({ theme }) => theme.font.tertiary};
`

const BottomButton = styled(Button)`
  border-top: 1px solid ${({ theme }) => theme.border.secondary};
  border-radius: 0;
  height: 85px;
  margin: 0;
  flex-direction: column;
`

const SendButton = styled(BottomButton)``
const EditButton = styled(BottomButton)``

const ButtonText = styled.div`
  font-size: 12px;
  margin-top: 10px;
`

const Separator = styled.div`
  width: 1px;
  background-color: ${({ theme }) => theme.border.secondary};
`

const PlaceholderCard = styled(Card)`
  padding: 70px 30px 30px 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
`

const Text = styled.div`
  color: ${({ theme }) => theme.font.tertiary};
  text-align: center;
  line-height: 1.3;
  margin-bottom: 20px;
`

const ContactBox = styled(Box)`
  padding: var(--spacing-4);
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: var(--spacing-4);
`
