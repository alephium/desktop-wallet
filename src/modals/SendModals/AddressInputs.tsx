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
import { ArrowDown, ContactIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import AddressEllipsed from '@/components/AddressEllipsed'
import Box from '@/components/Box'
import { inputStyling } from '@/components/Inputs'
import AddressSelect from '@/components/Inputs/AddressSelect'
import Input from '@/components/Inputs/Input'
import { SelectOption, SelectOptionsModal } from '@/components/Inputs/Select'
import SelectOptionItemContent from '@/components/Inputs/SelectOptionItemContent'
import HorizontalDivider from '@/components/PageComponents/HorizontalDivider'
import Truncate from '@/components/Truncate'
import { useAppSelector } from '@/hooks/redux'
import ModalPortal from '@/modals/ModalPortal'
import InputsSection from '@/modals/SendModals/InputsSection'
import { selectAllContacts } from '@/storage/addresses/addressesSelectors'
import { Address, AddressHash } from '@/types/addresses'
import { Contact } from '@/types/contacts'
import { filterContacts } from '@/utils/contacts'

interface AddressInputsProps {
  defaultFromAddress: Address
  toAddress: { value: string; error: string }
  fromAddresses: Address[]
  onFromAddressChange: (address: Address) => void
  onToAddressChange: (address: string) => void
  onContactSelect: (address: string) => void
  className?: string
}

type InputFieldMode = 'view' | 'edit'

const AddressInputs = ({
  defaultFromAddress,
  fromAddresses,
  toAddress,
  onFromAddressChange,
  onToAddressChange,
  onContactSelect,
  className
}: AddressInputsProps) => {
  const { t } = useTranslation()
  const updatedInitialAddress = fromAddresses.find((a) => a.hash === defaultFromAddress.hash) ?? defaultFromAddress

  const contacts = useAppSelector(selectAllContacts)
  const inputRef = useRef<HTMLInputElement>(null)

  const [isAddressSelectModalOpen, setIsAddressSelectModalOpen] = useState(false)
  const [contact, setContact] = useState<Contact>()
  const [filteredContacts, setFilteredContacts] = useState(contacts)
  const [inputFieldMode, setInputFieldMode] = useState<InputFieldMode>('view')

  const isContactVisible = contact && inputFieldMode === 'view'
  const contactSelectOptions: SelectOption<AddressHash>[] = contacts.map((contact) => ({
    value: contact.address,
    label: contact.name
  }))

  useEffect(() => {
    const existingContact = contacts.find((c) => c.address === toAddress.value)

    setContact(existingContact)
  }, [contacts, toAddress.value])

  const handleContactSelect = (contactAddress: SelectOption<AddressHash>) => onContactSelect(contactAddress.value)

  const handleFocus = () => {
    inputRef.current?.focus()
    setInputFieldMode('edit')
  }

  const handleContactsSearch = (searchInput: string) =>
    setFilteredContacts(filterContacts(contacts, searchInput.toLowerCase()))

  const handleContactSelectModalClose = () => {
    setIsAddressSelectModalOpen(false)
    setFilteredContacts(contacts)
  }

  return (
    <InputsSection title={t('Addresses')} className={className}>
      <BoxStyled>
        <AddressSelect
          label={t('From')}
          title={t('Select the address to send funds from.')}
          options={fromAddresses}
          defaultAddress={updatedInitialAddress}
          onAddressChange={onFromAddressChange}
          id="from-address"
          hideEmptyAvailableBalance
          simpleMode
        />
        <HorizontalDividerStyled>
          <DividerArrowRow>
            <DividerArrow size={15} />
          </DividerArrowRow>
        </HorizontalDividerStyled>
        <AddressToInput
          label={t('To')}
          inputFieldRef={inputRef}
          value={toAddress.value}
          error={toAddress.error}
          onFocus={handleFocus}
          onBlur={() => setInputFieldMode('view')}
          onChange={(e) => onToAddressChange(e.target.value)}
          inputFieldStyle={{
            color: isContactVisible ? 'transparent' : undefined,
            transition: 'all 0.2s ease-out'
          }}
          Icon={ContactIcon}
          onIconPress={() => setIsAddressSelectModalOpen(true)}
        >
          {isContactVisible && (
            <ContactRow onClick={handleFocus}>
              <Truncate>{contact.name}</Truncate>
              <AddressEllipsedStyled addressHash={contact.address} disableA11y />
            </ContactRow>
          )}
        </AddressToInput>
      </BoxStyled>
      <ModalPortal>
        {isAddressSelectModalOpen && (
          <SelectOptionsModal
            title={t('Choose a contact')}
            options={contactSelectOptions}
            showOnly={filteredContacts.map((contact) => contact.address)}
            setValue={handleContactSelect}
            onClose={handleContactSelectModalClose}
            onSearchInput={handleContactsSearch}
            searchPlaceholder={t('Search for name or a hash...')}
            optionRender={(contact) => (
              <SelectOptionItemContent
                ContentLeft={<Name>{contact.label}</Name>}
                ContentRight={<AddressEllipsedStyled addressHash={contact.value} />}
              />
            )}
          />
        )}
      </ModalPortal>
    </InputsSection>
  )
}

export default AddressInputs

const Name = styled(Truncate)`
  font-weight: var(--fontWeight-semiBold);
  max-width: 200px;
`

const AddressEllipsedStyled = styled(AddressEllipsed)`
  margin-left: auto;
  color: ${({ theme }) => theme.font.secondary};
  max-width: 120px;
`

const ContactRow = styled(motion.div)`
  display: flex;
  gap: var(--spacing-2);
  position: absolute;
  width: 85%;
  height: 100%;
  align-items: center;
  top: 6px;
  left: ${inputStyling.paddingLeftRight};
  transition: opacity 0.2s ease-out;
`

const BoxStyled = styled(Box)`
  padding: 10px;
`

const HorizontalDividerStyled = styled(HorizontalDivider)`
  position: relative;
  margin: 10px 0;
`

const DividerArrowRow = styled.div`
  position: absolute;
  top: -8px;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: center;
`

const DividerArrow = styled(ArrowDown)`
  padding: 0 13px;
  background-color: ${({ theme }) => theme.bg.secondary};
  color: ${({ theme }) => theme.border.primary};
  display: flex;
  width: auto;
  height: auto;
`

const AddressToInput = styled(Input)`
  margin: 0;
  border: 0;

  &:not(:hover) {
    background-color: transparent;
  }
`
