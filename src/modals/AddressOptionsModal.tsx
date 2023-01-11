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

import { AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { useTheme } from 'styled-components'

import AddressMetadataForm from '@/components/AddressMetadataForm'
import Amount from '@/components/Amount'
import KeyValueInput from '@/components/Inputs/InlineLabelValueInput'
import HorizontalDivider from '@/components/PageComponents/HorizontalDivider'
import { Address, useAddressesContext } from '@/contexts/addresses'
import { useGlobalContext } from '@/contexts/global'
import { getRandomLabelColor } from '@/utils/colors'

import AddressSweepModal from './AddressSweepModal'
import CenteredModal, { ModalFooterButton, ModalFooterButtons } from './CenteredModal'

interface AddressOptionsModal {
  address: Address
  onClose: () => void
}

const AddressOptionsModal = ({ address, onClose }: AddressOptionsModal) => {
  const { t } = useTranslation()
  const { addresses, updateAddressSettings, mainAddress } = useAddressesContext()
  const [addressLabel, setAddressLabel] = useState({
    title: address?.settings.label ?? '',
    color: address?.settings.color || getRandomLabelColor()
  })
  const [isMainAddress, setIsMainAddress] = useState(address?.settings.isMain ?? false)
  const { isPassphraseUsed } = useGlobalContext()
  const [isAddressSweepModalOpen, setIsAddressSweepModalOpen] = useState(false)
  const theme = useTheme()

  if (!address || !mainAddress) return null

  const isMainAddressToggleEnabled = mainAddress.hash !== address.hash
  const isSweepButtonEnabled = addresses.length > 1 && address.availableBalance > 0

  const onGenerateClick = () => {
    updateAddressSettings(address, {
      isMain: isMainAddressToggleEnabled ? isMainAddress : address.settings.isMain,
      label: addressLabel.title,
      color: addressLabel.color
    })
    if (isMainAddress && isMainAddressToggleEnabled) {
      updateAddressSettings(mainAddress, { ...mainAddress.settings, isMain: false })
    }
    onClose()
  }

  let mainAddressMessage = `${t`Default address for sending transactions.`} `
  mainAddressMessage += isMainAddressToggleEnabled
    ? t('Note that if activated, "{{ address }}" will not be the default address anymore.', {
        address: mainAddress.getName()
      })
    : t`To remove this address from being the default address, you must set another one as default first.`

  return (
    <>
      <CenteredModal title={t`Address options`} subtitle={address.getName()} onClose={onClose}>
        {!isPassphraseUsed && (
          <>
            <AddressMetadataForm
              label={addressLabel}
              setLabel={setAddressLabel}
              mainAddressMessage={mainAddressMessage}
              isMain={isMainAddress}
              setIsMain={setIsMainAddress}
              isMainAddressToggleEnabled={isMainAddressToggleEnabled}
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
                {t`Available`}: <Amount value={address.availableBalance} color={theme.font.secondary} />
              </AvailableAmount>
            </SweepButton>
          }
        />
        <HorizontalDivider narrow />
        <ModalFooterButtons>
          <ModalFooterButton mode="secondary" onClick={onClose}>
            {t`Cancel`}
          </ModalFooterButton>
          <ModalFooterButton onClick={onGenerateClick}>{t`Save`}</ModalFooterButton>
        </ModalFooterButtons>
      </CenteredModal>
      <AnimatePresence mode="wait" initial={true}>
        {isAddressSweepModalOpen && (
          <AddressSweepModal
            sweepAddress={address}
            onClose={() => setIsAddressSweepModalOpen(false)}
            onSuccessfulSweep={onClose}
          />
        )}
      </AnimatePresence>
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
