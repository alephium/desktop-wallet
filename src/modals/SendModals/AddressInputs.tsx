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
import { AlbumIcon, ContactIcon, ScanLineIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { useTheme } from 'styled-components'

import Box from '@/components/Box'
import Button from '@/components/Button'
import HashEllipsed from '@/components/HashEllipsed'
import { inputStyling } from '@/components/Inputs'
import AddressSelect from '@/components/Inputs/AddressSelect'
import Input from '@/components/Inputs/Input'
import { SelectOption, SelectOptionsModal } from '@/components/Inputs/Select'
import SelectOptionItemContent from '@/components/Inputs/SelectOptionItemContent'
import SkeletonLoader from '@/components/SkeletonLoader'
import Truncate from '@/components/Truncate'
import { useAppSelector } from '@/hooks/redux'
import AddressSelectModal from '@/modals/AddressSelectModal'
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
  const theme = useTheme()

  const [isContactSelectModalOpen, setIsContactSelectModalOpen] = useState(false)
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

  const handleToOwnAddressModalClose = () => {
    setIsAddressSelectModalOpen(false)
    moveFocusOnPreviousModal()
  }

  const handleContactSelectModalClose = () => {
    setIsContactSelectModalOpen(false)
    setFilteredContacts(contacts)
    moveFocusOnPreviousModal()
  }

  return (
    <InputsContainer>
      <InputsSection
        title={t('Origin')}
        subtitle={t('One of your addresses to send the transaction from.')}
        className={className}
      >
        <BoxStyled>
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
              shouldDisplayAddressSelectModal={isAddressSelectModalOpen}
            />
          )}
        </BoxStyled>
      </InputsSection>
      {toAddress && onToAddressChange && (
        <InputsSection
          title={t('Destination')}
          subtitle={t('The address which will receive the transaction.')}
          className={className}
        >
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
            largeText
          >
            {isContactVisible && (
              <ContactRow onClick={handleFocus}>
                <Truncate>{contact.name}</Truncate>
                <HashEllipsedStyled hash={contact.address} disableA11y />
              </ContactRow>
            )}
          </AddressToInput>

          <DestinationActions>
            <Button
              Icon={ContactIcon}
              iconColor={theme.global.accent}
              variant="faded"
              short
              borderless
              onClick={() => setIsContactSelectModalOpen(true)}
            >
              Contacts
            </Button>
            <Button
              Icon={AlbumIcon}
              iconColor={theme.global.accent}
              variant="faded"
              short
              borderless
              onClick={() => setIsAddressSelectModalOpen(true)}
            >
              Your addresses
            </Button>
            <Button Icon={ScanLineIcon} iconColor={theme.global.accent} variant="faded" short borderless>
              Scan
            </Button>
          </DestinationActions>
        </InputsSection>
      )}

      <ModalPortal>
        {isContactSelectModalOpen && (
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
        {isAddressSelectModalOpen && onToAddressChange && (
          <AddressSelectModal
            title={t('Select the address to send funds to.')}
            options={fromAddresses}
            onAddressSelect={(address) => onToAddressChange(address.hash)}
            onClose={handleToOwnAddressModalClose}
            selectedAddress={fromAddresses.find((a) => a.hash === toAddress?.value)}
          />
        )}
      </ModalPortal>
    </InputsContainer>
  )
}

export default AddressInputs

const InputsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
`

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
  height: 100%;
  align-items: center;
  top: 0;
  left: ${inputStyling.paddingLeftRight};
  right: ${inputStyling.paddingLeftRight};
  transition: opacity 0.2s ease-out;
`

const BoxStyled = styled(Box)`
  display: flex;
  align-items: center;
  gap: 10px;
  height: var(--inputHeight);
`

const AddressToInput = styled(Input)`
  margin: 0;
`

const DestinationActions = styled.div`
  display: flex;
  gap: 5px;
`
