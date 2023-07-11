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
import { ArrowDown, ContactIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import Box from '@/components/Box'
import HashEllipsed from '@/components/HashEllipsed'
import { inputStyling } from '@/components/Inputs'
import AddressSelect from '@/components/Inputs/AddressSelect'
import Input from '@/components/Inputs/Input'
import { SelectOption, SelectOptionsModal } from '@/components/Inputs/Select'
import SelectOptionItemContent from '@/components/Inputs/SelectOptionItemContent'
import VerticalDivider from '@/components/PageComponents/VerticalDivider'
import SkeletonLoader from '@/components/SkeletonLoader'
import Truncate from '@/components/Truncate'
import { useAppSelector } from '@/hooks/redux'
import { useMoveFocusOnPreviousModal } from '@/modals/ModalContainer'
import ModalPortal from '@/modals/ModalPortal'
import InputsSection from '@/modals/SendModals/InputsSection'
import { selectAllContacts, selectIsStateUninitialized } from '@/storage/addresses/addressesSelectors'
import { Address, AddressHash } from '@/types/addresses'
import { Contact } from '@/types/contacts'
import { filterContacts } from '@/utils/contacts'

interface AddressInputsProps {
  defaultFromAddress: Address
  toAddress?: { value: string; error: string }
  fromAddresses: Address[]
  onFromAddressChange: (address: Address) => void
  onToAddressChange?: (address: string) => void
  onContactSelect?: (address: string) => void
  hideFromAddressesWithoutAssets?: boolean
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
  hideFromAddressesWithoutAssets,
  className
}: AddressInputsProps) => {
  const { t } = useTranslation()
  const updatedInitialAddress = fromAddresses.find((a) => a.hash === defaultFromAddress.hash) ?? defaultFromAddress
  const moveFocusOnPreviousModal = useMoveFocusOnPreviousModal()
  const contacts = useAppSelector(selectAllContacts)
  const isAddressesStateUninitialized = useAppSelector(selectIsStateUninitialized)
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
    const existingContact = contacts.find((c) => c.address === toAddress?.value)

    setContact(existingContact)
  }, [contacts, toAddress?.value])

  const handleContactSelect = (contactAddress: SelectOption<AddressHash>) =>
    onContactSelect && onContactSelect(contactAddress.value)

  const handleFocus = () => {
    inputRef.current?.focus()
    setInputFieldMode('edit')
  }

  const handleContactsSearch = (searchInput: string) =>
    setFilteredContacts(filterContacts(contacts, searchInput.toLowerCase()))

  const handleContactSelectModalClose = () => {
    setIsAddressSelectModalOpen(false)
    setFilteredContacts(contacts)
    moveFocusOnPreviousModal()
  }

  return (
    <InputsSection title={t('Addresses')} className={className}>
      <BoxStyled>
        <InputFixedLabel>{t('From')}</InputFixedLabel>
        <VerticalDivider />
        {isAddressesStateUninitialized ? (
          <SkeletonLoader height="55px" />
        ) : (
          <AddressSelect
            title={t('Select the address to send funds from.')}
            options={fromAddresses}
            defaultAddress={updatedInitialAddress}
            onAddressChange={onFromAddressChange}
            id="from-address"
            hideAddressesWithoutAssets={hideFromAddressesWithoutAssets}
            simpleMode
          />
        )}
      </BoxStyled>

      {toAddress && onToAddressChange && (
        <>
          <DividerArrowRow>
            <DividerArrow size={20} />
          </DividerArrowRow>

          <BoxStyled>
            <InputFixedLabel>{t('To')}</InputFixedLabel>
            <VerticalDivider />
            <AddressToInput
              inputFieldRef={inputRef}
              value={toAddress.value}
              error={toAddress.error}
              onFocus={handleFocus}
              onBlur={() => setInputFieldMode('view')}
              onChange={(e) => onToAddressChange(e.target.value.trim())}
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
                  <HashEllipsedStyled hash={contact.address} disableA11y />
                </ContactRow>
              )}
            </AddressToInput>
          </BoxStyled>
        </>
      )}

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
            parentSelectRef={inputRef}
            optionRender={(contact) => (
              <SelectOptionItemContent
                MainContent={<Name>{contact.label}</Name>}
                SecondaryContent={<HashEllipsedStyled hash={contact.value} disableA11y />}
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

const HashEllipsedStyled = styled(HashEllipsed)`
  margin-left: auto;
  color: ${({ theme }) => theme.font.secondary};
  max-width: 150px;
`

const ContactRow = styled(motion.div)`
  display: flex;
  gap: var(--spacing-2);
  position: absolute;
  width: 85%;
  height: 100%;
  align-items: center;
  top: 0;
  left: ${inputStyling.paddingLeftRight};
  transition: opacity 0.2s ease-out;
`

const BoxStyled = styled(Box)`
  display: flex;
  align-items: center;
  padding: 5px;
  gap: 10px;
`

const AddressToInput = styled(Input)`
  margin: 0;
  border: 1px solid transparent;

  &:not(:hover) {
    background-color: transparent;
  }
`

const InputFixedLabel = styled.div`
  min-width: 12%;
  padding-left: 20px;
  color: ${({ theme }) => theme.font.secondary};
`

const DividerArrowRow = styled.div`
  height: 20px;
  margin: -5px 0;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`

const DividerArrow = styled(ArrowDown)`
  padding: 2px;
  color: ${({ theme }) => theme.font.tertiary};
  border-radius: var(--radius-full);
  border: 1px solid ${({ theme }) => theme.border.primary};
  background-color: ${({ theme }) => theme.bg.primary};
  box-shadow: ${({ theme }) => theme.shadow.primary};
`
