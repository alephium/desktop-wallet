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
import AddressEllipsed from '@/components/AddressEllipsed'
import Amount from '@/components/Amount'
import InfoBox from '@/components/InfoBox'
import { inputDefaultStyle, InputLabel, InputProps } from '@/components/Inputs'
import Option from '@/components/Inputs/Option'
import { MoreIcon, SelectContainer } from '@/components/Inputs/Select'
import { sectionChildrenVariants } from '@/components/PageComponents/PageContainers'
import CenteredModal, { ModalFooterButton, ModalFooterButtons } from '@/modals/CenteredModal'
import ModalPortal from '@/modals/ModalPortal'
import { Address } from '@/types/addresses'
import { getAvailableBalance } from '@/utils/addresses'

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
  const [canBeAnimated, setCanBeAnimated] = useState(false)
  const [address, setAddress] = useState(defaultAddress)
  const [isAddressSelectModalOpen, setIsAddressSelectModalOpen] = useState(false)

  useEffect(() => {
    if (!address && options.length === 1) {
      setAddress(options[0])
    }
  }, [options, setAddress, address])

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
        <InputLabel inputHasValue={!!address} htmlFor={id}>
          {label}
        </InputLabel>
        {!disabled && !simpleMode && (
          <MoreIcon>
            <MoreVertical />
          </MoreIcon>
        )}
        <ClickableInput type="button" className={className} disabled={disabled} id={id} simpleMode={simpleMode}>
          <AddressBadge addressHash={address.hash} truncate showHashWhenNoLabel />
          {!!address.label && !simpleMode && <AddressEllipsed addressHash={address.hash} />}
        </ClickableInput>
      </AddressSelectContainer>
      <ModalPortal>
        {isAddressSelectModalOpen && (
          <AddressSelectModal
            options={options}
            selectedOption={address}
            setAddress={setAddress}
            title={title}
            hideEmptyAvailableBalance={hideEmptyAvailableBalance}
            onClose={() => {
              setIsAddressSelectModalOpen(false)
            }}
          />
        )}
      </ModalPortal>
    </>
  )
}

const AddressSelectModal = ({
  options,
  selectedOption,
  setAddress,
  onClose,
  title,
  hideEmptyAvailableBalance
}: {
  options: Address[]
  selectedOption?: Address
  setAddress: (address: Address) => void | undefined
  onClose: () => void
  title: string
  hideEmptyAvailableBalance?: boolean
}) => {
  const { t } = useTranslation()
  const [selectedAddress, setSelectedAddress] = useState(selectedOption)
  const displayedOptions = hideEmptyAvailableBalance
    ? options.filter((address) => getAvailableBalance(address) > 0)
    : options
  const noAddressesWithAvailableBalance = hideEmptyAvailableBalance && displayedOptions.length === 0

  const onOptionAddressSelect = (address: Address) => {
    setAddress(address)
    onClose()
  }

  return (
    <CenteredModal title={t`Addresses`} onClose={onClose}>
      <Description>{title}</Description>
      <div>
        {displayedOptions.map((address) => (
          <Option
            key={address.hash}
            onSelect={() => setSelectedAddress(address)}
            isSelected={selectedAddress?.hash === address.hash}
          >
            <AddressBadgeStyled addressHash={address.hash} showHashWhenNoLabel />
            <AmountStyled value={BigInt(address.balance)} fadeDecimals />
          </Option>
        ))}
        {noAddressesWithAvailableBalance && (
          <InfoBox
            importance="accent"
            text={t`There are no addresses with available balance. Please, send some funds to one of your addresses, and try again.`}
          />
        )}
      </div>
      <ModalFooterButtons>
        <ModalFooterButton role="secondary" onClick={onClose}>
          {t`Cancel`}
        </ModalFooterButton>
        <ModalFooterButton
          onClick={() => selectedAddress && onOptionAddressSelect(selectedAddress)}
          disabled={!selectedAddress || noAddressesWithAvailableBalance}
        >
          {t`Select`}
        </ModalFooterButton>
      </ModalFooterButtons>
    </CenteredModal>
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

const Description = styled.div`
  margin-bottom: var(--spacing-5);
  color: ${({ theme }) => theme.font.secondary};
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

const AmountStyled = styled(Amount)`
  flex: 1;
  text-align: right;
`

const AddressBadgeStyled = styled(AddressBadge)`
  width: auto;
`
