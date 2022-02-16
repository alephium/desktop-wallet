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
import styled from 'styled-components'

import Amount from '../../components/Amount'
import ColoredLabelInput from '../../components/Inputs/ColoredLabelInput'
import KeyValueInput from '../../components/Inputs/InlineLabelValueInput'
import Toggle from '../../components/Inputs/Toggle'
import ModalCenteded, { ModalFooterButton, ModalFooterButtons } from '../../components/ModalCentered'
import HorizontalDivider from '../../components/PageComponents/HorizontalDivider'
import { Address, useAddressesContext } from '../../contexts/addresses'
import { useGlobalContext } from '../../contexts/global'
import { getRandomLabelColor } from '../../utils/colors'
import AddressSweepModal from './AddressSweepModal'

interface AddressOptionsModal {
  address: Address
  onClose: () => void
}

const AddressOptionsModal = ({ address, onClose }: AddressOptionsModal) => {
  const { addresses, updateAddressSettings, mainAddress } = useAddressesContext()
  const [addressLabel, setAddressLabel] = useState({
    title: address?.settings.label ?? '',
    color: address?.settings.color ?? getRandomLabelColor()
  })
  const [isMainAddress, setIsMainAddress] = useState(address?.settings.isMain ?? false)
  const { wallet } = useGlobalContext()
  const [isAddressSweepModalOpen, setIsAddressSweepModalOpen] = useState(false)

  if (!address || !wallet || !mainAddress) return null

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

  let mainAddressMessage = 'Default address for sending transactions.'
  mainAddressMessage += isMainAddressToggleEnabled
    ? ` Note that if activated, "${mainAddress.displayName()}" will not be the main address anymore.`
    : ' To remove this address from being the main address, you must set another one as main first.'

  return (
    <>
      <ModalCenteded title="Address options" subtitle={address.displayName()} onClose={onClose}>
        <ColoredLabelInput placeholder="Address label" onChange={setAddressLabel} value={addressLabel} id="label" />
        <HorizontalDivider narrow />
        <KeyValueInput
          label="★ Main address"
          description={mainAddressMessage}
          InputComponent={
            <Toggle
              toggled={isMainAddress}
              onToggle={() => setIsMainAddress(!isMainAddress)}
              disabled={!isMainAddressToggleEnabled}
            />
          }
        />
        <HorizontalDivider narrow />
        <KeyValueInput
          label="Sweep address"
          description="Sweep all the unlocked funds of this address to another address."
          InputComponent={
            <SweepButton>
              <ModalFooterButton
                alert
                onClick={() => isSweepButtonEnabled && setIsAddressSweepModalOpen(true)}
                disabled={!isSweepButtonEnabled}
              >
                Sweep
              </ModalFooterButton>
              <AvailableAmount>
                Available: <Amount value={address.availableBalance} />
              </AvailableAmount>
            </SweepButton>
          }
        />
        <HorizontalDivider narrow />
        <ModalFooterButtons>
          <ModalFooterButton secondary onClick={onClose}>
            Cancel
          </ModalFooterButton>
          <ModalFooterButton onClick={onGenerateClick}>Save</ModalFooterButton>
        </ModalFooterButtons>
      </ModalCenteded>
      <AnimatePresence exitBeforeEnter initial={true}>
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

const SweepButton = styled.div``

const AvailableAmount = styled.div`
  font-size: 10px;
  color: ${({ theme }) => theme.font.secondary};
`
export default AddressOptionsModal
