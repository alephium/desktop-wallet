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
import ModalPortal from '@/modals/ModalPortal'
import { Address, AddressHash } from '@/types/addresses'
import { filterAddresses } from '@/utils/addresses'

interface AddressSelectProps {
  id: string
  title: string
  options: Address[]
  onAddressChange: (address: Address) => void
  defaultAddress?: Address
  label?: string
  disabled?: boolean
  hideEmptyAvailableBalance?: boolean
  simpleMode?: boolean
  className?: string
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
  hideEmptyAvailableBalance,
  simpleMode = false
}: AddressSelectProps) {
  const { t } = useTranslation()
  const assetsInfo = useAppSelector((state) => state.assetsInfo.entities)

  const [canBeAnimated, setCanBeAnimated] = useState(false)
  const [address, setAddress] = useState(defaultAddress)
  const [isAddressSelectModalOpen, setIsAddressSelectModalOpen] = useState(false)
  const addresses = hideEmptyAvailableBalance ? options.filter((address) => address.balance !== '0') : options
  const [filteredAddresses, setFilteredAddresses] = useState(addresses)

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
  }

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
        onMouseDown={() => !disabled && setIsAddressSelectModalOpen(true)}
        disabled={!!disabled}
        heightSize={simpleMode ? 'normal' : 'big'}
        simpleMode={simpleMode}
      >
        <InputLabel isElevated={!!address} htmlFor={id}>
          {label}
        </InputLabel>
        {!disabled && !simpleMode && (
          <MoreIcon>
            <MoreVertical />
          </MoreIcon>
        )}
        <ClickableInput type="button" className={className} disabled={disabled} id={id} simpleMode={simpleMode}>
          <AddressBadge addressHash={address.hash} truncate showHashWhenNoLabel />
          {!!address.label && !simpleMode && <HashEllipsed hash={address.hash} />}
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
            optionRender={(option) => {
              const address = addresses.find((address) => address.hash === option.value)
              if (address) return <SelectOptionAddress address={address} />
            }}
            emptyListPlaceholder={t(
              'There are no addresses with available balance. Please, send some funds to one of your addresses, and try again.'
            )}
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
    `}

  ${({ simpleMode }) =>
    simpleMode &&
    css`
      margin: 0;
    `}
`

const ClickableInput = styled.div<InputProps & Pick<AddressSelectProps, 'simpleMode'>>`
  ${({ isValid, Icon, simpleMode }) => inputDefaultStyle(isValid || !!Icon, true, true, simpleMode ? 'normal' : 'big')};
  display: flex;
  align-items: center;
  padding-right: 50px;
  gap: var(--spacing-2);
  cursor: ${({ disabled }) => (disabled ? 'auto' : 'pointer')};

  ${({ simpleMode }) =>
    simpleMode &&
    css`
      border: 0;

      &:not(:hover) {
        background-color: transparent;
      }
    `}
`
