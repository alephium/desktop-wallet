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

import ColoredLabelInput from '../../components/Inputs/ColoredLabelInput'
import KeyValueInput from '../../components/Inputs/InlineLabelValueInput'
import Toggle from '../../components/Inputs/Toggle'
import { ModalFooterButton, ModalFooterButtons } from '../../components/Modal'
import Modal from '../../components/Modal'
import HorizontalDivider from '../../components/PageComponents/HorizontalDivider'
import { Section } from '../../components/PageComponents/PageContainers'
import { useAddressesContext } from '../../contexts/addresses'
import { useGlobalContext } from '../../contexts/global'
import { getRandomLabelColor } from '../../utils/colors'

interface AddressOptionsModal {
  addressHash: string
  onClose: () => void
}

const AddressOptionsModal = ({ addressHash, onClose }: AddressOptionsModal) => {
  const { addresses, getAddress, updateAddressSettings } = useAddressesContext()
  const currentMainAddress = addresses.find(({ settings: { isMain } }) => isMain)
  const address = getAddress(addressHash)
  const disableMainAddressToggle = currentMainAddress?.hash === addressHash
  const [addressLabel, setAddressLabel] = useState({
    title: address?.settings.label ?? '',
    color: address?.settings.color ?? getRandomLabelColor()
  })
  const [isMainAddress, setIsMainAddress] = useState(address?.settings.isMain ?? false)
  const { wallet } = useGlobalContext()

  const onGenerateClick = () => {
    if (!address) return

    updateAddressSettings(address, {
      isMain: disableMainAddressToggle ? address.settings.isMain : isMainAddress,
      label: addressLabel.title,
      color: addressLabel.color
    })
    if (isMainAddress && currentMainAddress && !disableMainAddressToggle) {
      updateAddressSettings(currentMainAddress, { ...currentMainAddress.settings, isMain: false })
    }
    onClose()
  }

  let mainAddressMessage = 'Default address for sending transactions.'

  if (currentMainAddress && wallet?.seed) {
    mainAddressMessage += !disableMainAddressToggle
      ? ` Note that if activated, "${
          currentMainAddress.settings.label || `${currentMainAddress.hash.substring(0, 10)}...`
        }" will not be the main address anymore.`
      : ' To remove this address from being the main address, you must set another one as main first.'
  }

  return (
    <Modal title="Address options" subtitle={address?.settings.label ?? addressHash} onClose={onClose}>
      <Section>
        <ColoredLabelInput placeholder="Address label" onChange={setAddressLabel} value={addressLabel} id="label" />
        <HorizontalDivider narrow />
        <KeyValueInput
          label="Main address"
          description={mainAddressMessage}
          InputComponent={
            <Toggle
              toggled={isMainAddress}
              onToggle={() => setIsMainAddress(!isMainAddress)}
              disabled={disableMainAddressToggle}
            />
          }
        />
      </Section>
      <ModalFooterButtons>
        <ModalFooterButton secondary onClick={onClose}>
          Cancel
        </ModalFooterButton>
        <ModalFooterButton onClick={onGenerateClick}>Save</ModalFooterButton>
      </ModalFooterButtons>
    </Modal>
  )
}

export default AddressOptionsModal
