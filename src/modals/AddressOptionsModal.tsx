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

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { useTheme } from 'styled-components'

import AddressMetadataForm from '@/components/AddressMetadataForm'
import Amount from '@/components/Amount'
import KeyValueInput from '@/components/Inputs/InlineLabelValueInput'
import HorizontalDivider from '@/components/PageComponents/HorizontalDivider'
import { useAppSelector } from '@/hooks/redux'
import { selectAllAddresses, selectDefaultAddress } from '@/storage/app-state/slices/addressesSlice'
import { saveAddressSettings } from '@/storage/storage-utils/addressesStorageUtils'
import { Address } from '@/types/addresses'
import { getAvailableBalance, getName } from '@/utils/addresses'
import { getRandomLabelColor } from '@/utils/colors'

import AddressSweepModal from './AddressSweepModal'
import CenteredModal, { ModalFooterButton, ModalFooterButtons } from './CenteredModal'
import ModalPortal from './ModalPortal'

interface AddressOptionsModalProps {
  address: Address
  onClose: () => void
}

const AddressOptionsModal = ({ address, onClose }: AddressOptionsModalProps) => {
  const { t } = useTranslation()
  const theme = useTheme()
  const { name: walletName, mnemonic, isPassphraseUsed } = useAppSelector((state) => state.activeWallet)
  const defaultAddress = useAppSelector(selectDefaultAddress)
  const addresses = useAppSelector(selectAllAddresses)

  const [addressLabel, setAddressLabel] = useState({
    title: address.label ?? '',
    color: address.color || getRandomLabelColor()
  })
  const [isDefaultAddress, setIsDefaultAddress] = useState(address.isDefault ?? false)
  const [isAddressSweepModalOpen, setIsAddressSweepModalOpen] = useState(false)

  if (!address || !defaultAddress || !mnemonic || !walletName) return null

  const availableBalance = getAvailableBalance(address)
  const isDefaultAddressToggleEnabled = defaultAddress.hash !== address.hash
  const isSweepButtonEnabled = addresses.length > 1 && availableBalance > 0

  const onSaveClick = () => {
    saveAddressSettings(
      address,
      {
        isDefault: isDefaultAddressToggleEnabled ? isDefaultAddress : address.isDefault,
        label: addressLabel.title,
        color: addressLabel.color
      },
      { walletName, mnemonic }
    )
    onClose()
  }

  let defaultAddressMessage = `${t`Default address for sending transactions.`} `
  defaultAddressMessage += isDefaultAddressToggleEnabled
    ? t('Note that if activated, "{{ address }}" will not be the default address anymore.', {
        address: getName(defaultAddress)
      })
    : t`To remove this address from being the default address, you must set another one as default first.`

  return (
    <>
      <CenteredModal title={t`Address options`} subtitle={getName(address)} onClose={onClose}>
        {!isPassphraseUsed && (
          <>
            <AddressMetadataForm
              label={addressLabel}
              setLabel={setAddressLabel}
              defaultAddressMessage={defaultAddressMessage}
              isDefault={isDefaultAddress}
              setIsDefault={setIsDefaultAddress}
              isDefaultAddressToggleEnabled={isDefaultAddressToggleEnabled}
              singleAddress
            />
            <HorizontalDivider narrow />
          </>
        )}
        <KeyValueInput
          label={t`Sweep address`}
          description={t`Sweep all the unlocked funds of this address to another address.`}
          InputComponent={
            <SweepButton>
              <ModalFooterButton
                alert
                onClick={() => isSweepButtonEnabled && setIsAddressSweepModalOpen(true)}
                disabled={!isSweepButtonEnabled}
              >
                {t`Sweep`}
              </ModalFooterButton>
              <AvailableAmount tabIndex={0}>
                {t`Available`}: <Amount value={availableBalance} color={theme.font.secondary} />
              </AvailableAmount>
            </SweepButton>
          }
        />
        <HorizontalDivider narrow />
        <ModalFooterButtons>
          <ModalFooterButton role="secondary" onClick={onClose}>
            {t`Cancel`}
          </ModalFooterButton>
          <ModalFooterButton onClick={onSaveClick}>{t`Save`}</ModalFooterButton>
        </ModalFooterButtons>
      </CenteredModal>
      <ModalPortal>
        {isAddressSweepModalOpen && (
          <AddressSweepModal
            sweepAddress={address}
            onClose={() => setIsAddressSweepModalOpen(false)}
            onSuccessfulSweep={onClose}
          />
        )}
      </ModalPortal>
    </>
  )
}

export default AddressOptionsModal

const SweepButton = styled.div``

const AvailableAmount = styled.div`
  font-size: 10px;
  color: ${({ theme }) => theme.font.secondary};
  text-align: right;
`
