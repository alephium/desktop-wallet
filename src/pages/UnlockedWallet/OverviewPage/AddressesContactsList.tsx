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

import { convertSetToFiat } from '@alephium/sdk'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'

import { fadeIn } from '@/animations'
import AddressEllipsed from '@/components/AddressEllipsed'
import Amount from '@/components/Amount'
import DotIcon from '@/components/DotIcon'
import { TabItem } from '@/components/TabBar'
import Table, { TableRow } from '@/components/Table'
import TableCellAmount from '@/components/TableCellAmount'
import TableTabBar from '@/components/TableTabBar'
import { useAppSelector } from '@/hooks/redux'
import i18next from '@/i18n'
import AddressDetailsModal from '@/modals/AddressDetailsModal'
import ModalPortal from '@/modals/ModalPortal'
import SendModalTransfer from '@/modals/SendModals/SendModalTransfer'
import { selectAllAddresses } from '@/storage/app-state/slices/addressesSlice'
import { selectAllContacts } from '@/storage/app-state/slices/contactsSlice'
import { useGetPriceQuery } from '@/storage/app-state/slices/priceApiSlice'
import { Address } from '@/types/addresses'
import { Contact } from '@/types/contacts'
import { currencies } from '@/utils/currencies'

interface AddressesContactsListProps {
  className?: string
  limit?: number
}

const tabs = [
  { value: 'addresses', label: i18next.t('Addresses') },
  { value: 'contacts', label: i18next.t('Contacts') }
]

const AddressesContactsList = ({ className, limit }: AddressesContactsListProps) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [isLoadingAddresses] = useAppSelector((s) => [s.addresses.loading])

  const [currentTab, setCurrentTab] = useState<TabItem>(tabs[0])

  return (
    <Table isLoading={isLoadingAddresses} className={className} minWidth="350px">
      <TableTabBar
        items={tabs}
        onTabChange={(tab) => setCurrentTab(tab)}
        activeTab={currentTab}
        linkText={t('See more')}
        onLinkClick={() => navigate('/wallet/addresses')}
      />
      {
        {
          addresses: <AddressesList limit={limit} />,
          contacts: <ContactsList limit={limit} />
        }[currentTab.value]
      }
    </Table>
  )
}

const AddressesList = ({ className, limit }: AddressesContactsListProps) => {
  const addresses = useAppSelector(selectAllAddresses)
  const { data: price } = useGetPriceQuery(currencies.USD.ticker)

  const [selectedAddress, setSelectedAddress] = useState<Address>()

  const displayedAddresses = limit ? addresses.slice(0, limit) : addresses

  return (
    <motion.div {...fadeIn} className={className}>
      {displayedAddresses.map((address) => (
        <TableRow
          key={address.hash}
          role="row"
          tabIndex={0}
          onClick={() => setSelectedAddress(address)}
          onKeyPress={() => setSelectedAddress(address)}
        >
          <Row>
            <AddressColor>
              {address.isDefault ? <Star color={address.color}>★</Star> : <DotIcon size="big" color={address.color} />}
            </AddressColor>
            {address.label ? (
              <Column>
                <Label>{address.label}</Label>
                <Hash addressHash={address.hash} />
              </Column>
            ) : (
              <Label>
                <AddressEllipsed addressHash={address.hash} />
              </Label>
            )}
            <TableCellAmount>
              <Amount
                value={convertSetToFiat(BigInt(address.balance), price ?? 0)}
                fadeDecimals
                isFiat
                suffix={currencies['USD'].symbol}
                tabIndex={0}
              />
            </TableCellAmount>
          </Row>
        </TableRow>
      ))}
      <ModalPortal>
        {selectedAddress && (
          <AddressDetailsModal addressHash={selectedAddress.hash} onClose={() => setSelectedAddress(undefined)} />
        )}
      </ModalPortal>
    </motion.div>
  )
}
const ContactsList = ({ className, limit }: AddressesContactsListProps) => {
  const contacts = useAppSelector(selectAllContacts)

  const [isSendModalOpen, setIsSendModalOpen] = useState(false)
  const [selectedContact, setSelectedContact] = useState<Contact>()

  const displayedContacts = limit ? contacts.slice(0, limit) : contacts

  const handleContactClick = (contact: Contact) => {
    setSelectedContact(contact)
    setIsSendModalOpen(true)
  }

  const closeSendModal = () => {
    setSelectedContact(undefined)
    setIsSendModalOpen(false)
  }

  return (
    <motion.div {...fadeIn} className={className}>
      {displayedContacts.map((contact) => (
        <TableRow
          key={contact.address}
          role="row"
          tabIndex={0}
          onClick={() => handleContactClick(contact)}
          onKeyPress={() => handleContactClick(contact)}
        >
          <Row>
            <Column>
              <Label>{contact.name}</Label>
              <Hash addressHash={contact.address} />
            </Column>
          </Row>
        </TableRow>
      ))}
      <ModalPortal>
        {isSendModalOpen && (
          <SendModalTransfer initialTxData={{ toAddress: selectedContact?.address }} onClose={closeSendModal} />
        )}
      </ModalPortal>
    </motion.div>
  )
}

export default styled(AddressesContactsList)`
  margin-bottom: 45px;
`

const Row = styled.div`
  display: flex;
  align-items: center;
  flex-grow: 1;
`

const Column = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`

const Label = styled.div`
  font-size: 14px;
  font-weight: var(--fontWeight-semiBold);
  width: 200px;
`

const Hash = styled(AddressEllipsed)`
  color: ${({ theme }) => theme.font.tertiary};
  font-size: 11px;
  max-width: 100px;
`

const AddressColor = styled.div`
  width: 18px;
  display: flex;
  justify-content: center;
  margin-right: 15px;
`

const Star = styled.div<{ color: string }>`
  color: ${({ color }) => color};
  font-size: 18px;
`
