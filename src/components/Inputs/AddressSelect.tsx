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

import { MoreVertical } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { css } from 'styled-components'

import AddressBadge from '@/components/AddressBadge'
import HashEllipsed from '@/components/HashEllipsed'
import { inputDefaultStyle, InputLabel, InputProps } from '@/components/Inputs'
import { MoreIcon, SelectContainer, SelectOption, SelectOptionsModal } from '@/components/Inputs/Select'
import SelectOptionAddress from '@/components/Inputs/SelectOptionAddress'
import { sectionChildrenVariants } from '@/components/PageComponents/PageContainers'
import { useAppSelector } from '@/hooks/redux'
import { useMoveFocusOnPreviousModal } from '@/modals/ModalContainer'
import ModalPortal from '@/modals/ModalPortal'
import { Address, AddressHash } from '@/types/addresses'
import { addressHasAssets, filterAddresses, filterAddressesWithoutAssets } from '@/utils/addresses'
import { onEnterOrSpace } from '@/utils/misc'

interface AddressSelectProps {
  id: string
  title: string
  options: Address[]
  onAddressChange: (address: Address) => void
  defaultAddress?: Address
  label?: string
  disabled?: boolean
  hideAddressesWithoutAssets?: boolean
  simpleMode?: boolean
  noMargin?: boolean
  className?: string
  emptyListPlaceholder?: string
}

function AddressSelect({
  options,
  title,
  label,
  disabled,
  defaultAddress,
  className,
  id,
  onAddressChange,
  hideAddressesWithoutAssets,
  noMargin,
  simpleMode = false,
  emptyListPlaceholder
}: AddressSelectProps) {
  const { t } = useTranslation()
  const assetsInfo = useAppSelector((state) => state.assetsInfo.entities)
  const moveFocusOnPreviousModal = useMoveFocusOnPreviousModal()

  const [canBeAnimated, setCanBeAnimated] = useState(false)
  const [isAddressSelectModalOpen, setIsAddressSelectModalOpen] = useState(false)
  const addresses = hideAddressesWithoutAssets ? filterAddressesWithoutAssets(options) : options
  const [filteredAddresses, setFilteredAddresses] = useState(addresses)
  const defaultAddressHasAssets = defaultAddress && addressHasAssets(defaultAddress)

  let initialAddress = defaultAddress
  if (hideAddressesWithoutAssets) {
    if (!defaultAddressHasAssets && addresses.length > 0) {
      initialAddress = addresses[0]
    }
  } else if (!initialAddress && addresses.length > 0) {
    initialAddress = addresses[0]
  }

  const [address, setAddress] = useState(initialAddress)

  const addressSelectOptions: SelectOption<AddressHash>[] = addresses.map((address) => ({
    value: address.hash,
    label: address.label ?? address.hash
  }))

  const selectAddress = (option: SelectOption<AddressHash>) => {
    const selectedAddress = addresses.find((address) => address.hash === option.value)
    selectedAddress && setAddress(selectedAddress)
  }

  const handleSearch = (searchInput: string) =>
    setFilteredAddresses(filterAddresses(addresses, searchInput.toLowerCase(), assetsInfo))

  const handleAddressSelectModalClose = () => {
    setIsAddressSelectModalOpen(false)
    setFilteredAddresses(addresses)
    moveFocusOnPreviousModal()
  }

  const openAddressSelectModal = () => !disabled && setIsAddressSelectModalOpen(true)

  useEffect(() => {
    if (!address && addresses.length === 1) {
      setAddress(addresses[0])
    }
  }, [addresses, setAddress, address])

  useEffect(() => {
    if (address && address.hash !== defaultAddress?.hash) {
      onAddressChange(address)
    }
  }, [address, defaultAddress, onAddressChange])

  if (!address) return null

  return (
    <>
      <AddressSelectContainer
        variants={sectionChildrenVariants}
        animate={canBeAnimated ? (!disabled ? 'shown' : 'disabled') : false}
        onAnimationComplete={() => setCanBeAnimated(true)}
        custom={disabled}
        onMouseDown={openAddressSelectModal}
        onKeyDown={(e) => onEnterOrSpace(e, openAddressSelectModal)}
        disabled={disabled}
        heightSize={simpleMode ? 'normal' : 'big'}
        simpleMode={simpleMode}
        noMargin={noMargin}
      >
        {label && (
          <InputLabel isElevated={!!address} htmlFor={id}>
            {label}
          </InputLabel>
        )}
        {!disabled && !simpleMode && (
          <MoreIcon>
            <MoreVertical size={16} />
          </MoreIcon>
        )}
        <ClickableInput
          type="button"
          tabIndex={0}
          className={className}
          disabled={disabled}
          id={id}
          simpleMode={simpleMode}
          value={address.hash}
          label={label}
        >
          <AddressBadge addressHash={address.hash} showFull disableCopy />
          {!!address.label && !simpleMode && <HashEllipsed hash={address.hash} disableCopy />}
        </ClickableInput>
      </AddressSelectContainer>
      <ModalPortal>
        {isAddressSelectModalOpen && (
          <SelectOptionsModal
            title={title}
            options={addressSelectOptions}
            selectedOption={addressSelectOptions.find((a) => a.value === address.hash)}
            showOnly={filteredAddresses.map((address) => address.hash)}
            setValue={selectAddress}
            onClose={handleAddressSelectModalClose}
            onSearchInput={handleSearch}
            searchPlaceholder={t('Search for name or a hash...')}
            optionRender={(option, isSelected) => {
              const address = addresses.find((address) => address.hash === option.value)
              if (address) return <SelectOptionAddress address={address} isSelected={isSelected} />
            }}
            emptyListPlaceholder={
              emptyListPlaceholder ||
              (hideAddressesWithoutAssets
                ? t(
                    'There are no addresses with available balance. Please, send some funds to one of your addresses, and try again.'
                  )
                : t('There are no available addresses.'))
            }
          />
        )}
      </ModalPortal>
    </>
  )
}

export default AddressSelect

const AddressSelectContainer = styled(SelectContainer)<Pick<AddressSelectProps, 'disabled' | 'simpleMode'>>`
  ${({ disabled }) =>
    disabled &&
    css`
      cursor: not-allowed;
      box-shadow: none;
    `}

  ${({ simpleMode }) =>
    simpleMode &&
    css`
      margin: 0;
      box-shadow: none;
    `}
`

const ClickableInput = styled.div<InputProps & Pick<AddressSelectProps, 'simpleMode'>>`
  ${({ isValid, Icon, simpleMode, value, label }) =>
    inputDefaultStyle(isValid || !!Icon, !!value, !!label, simpleMode ? 'normal' : 'big')};
  display: flex;
  align-items: center;
  padding-right: 50px;
  gap: var(--spacing-2);
  cursor: ${({ disabled }) => (disabled ? 'auto' : 'pointer')};

  ${({ simpleMode }) =>
    simpleMode &&
    css`
      border: 0;
      background-color: transparent;

      &:hover {
        background-color: ${({ theme }) => theme.bg.hover};
      }
    `}
`
