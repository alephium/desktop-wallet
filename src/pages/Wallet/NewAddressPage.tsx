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

import addressToGroup from 'alephium-js/dist/lib/address'
import { TOTAL_NUMBER_OF_GROUPS } from 'alephium-js/dist/lib/constants'
import { deriveNewAddressData } from 'alephium-js/dist/lib/wallet'
import { useCallback, useEffect, useRef, useState } from 'react'

import ExpandableSection from '../../components/ExpandableSection'
import ColoredLabelInput from '../../components/Inputs/ColoredLabelInput'
import KeyValueInput from '../../components/Inputs/InlineLabelValueInput'
import Select from '../../components/Inputs/Select'
import Toggle from '../../components/Inputs/Toggle'
import { ModalFooterButton, ModalFooterButtons } from '../../components/Modal'
import HorizontalDivider from '../../components/PageComponents/HorizontalDivider'
import { Section } from '../../components/PageComponents/PageContainers'
import { Address, useAddressesContext } from '../../contexts/addresses'
import { useGlobalContext } from '../../contexts/global'
import { useModalContext } from '../../contexts/modal'
import { getRandomLabelColor } from '../../utils/colors'

const NewAddressPage = () => {
  const [addressLabel, setAddressLabel] = useState({ title: '', color: getRandomLabelColor() })
  const [isMainAddress, setIsMainAddress] = useState(false)
  const [newAddressData, setNewAddressData] =
    useState<{ address: string; publicKey: string; privateKey: string; addressIndex: number }>() // TODO: Replace with type AddressAndKeys from alephium-js
  const [newAddressGroup, setNewAddressGroup] = useState<number>()
  const { wallet } = useGlobalContext()
  const { addresses, updateAddressSettings, saveNewAddress, mainAddress } = useAddressesContext()
  const currentAddressIndexes = useRef(addresses.map(({ index }) => index))
  const { onModalClose } = useModalContext()

  const generateNewAddress = useCallback(
    (group?: number) => {
      if (!wallet?.seed) return
      const data = deriveNewAddressData(wallet.seed, group, undefined, currentAddressIndexes.current)
      setNewAddressData(data)
      setNewAddressGroup(group || addressToGroup(data.address, TOTAL_NUMBER_OF_GROUPS))
    },
    [wallet]
  )

  useEffect(() => {
    generateNewAddress()
  }, [generateNewAddress])

  const onGenerateClick = () => {
    if (newAddressData && newAddressGroup !== undefined) {
      saveNewAddress(
        new Address(
          newAddressData.address,
          newAddressData.publicKey,
          newAddressData.privateKey,
          newAddressData.addressIndex,
          {
            isMain: isMainAddress,
            label: addressLabel.title,
            color: addressLabel.color
          }
        )
      )
      if (isMainAddress && mainAddress && mainAddress.index !== newAddressData.addressIndex) {
        updateAddressSettings(mainAddress, { ...mainAddress.settings, isMain: false })
      }
    }
    onModalClose()
  }

  let mainAddressMessage = 'Default address for sending transactions.'

  if (mainAddress && wallet?.seed) {
    mainAddressMessage +=
      mainAddress.index !== newAddressData?.addressIndex
        ? ` Note that if activated, "${
            mainAddress.settings.label || `${mainAddress.hash.substring(0, 10)}...`
          }" will not be the main address anymore.`
        : ''
  }

  return (
    <>
      <Section>
        <ColoredLabelInput placeholder="Address label" onChange={setAddressLabel} value={addressLabel} id="label" />
        <HorizontalDivider narrow />
        <KeyValueInput
          label="Main address"
          description={mainAddressMessage}
          InputComponent={<Toggle toggled={isMainAddress} onToggle={() => setIsMainAddress(!isMainAddress)} />}
        />
      </Section>
      <ExpandableSection sectionTitle="Advanced options">
        <Select
          placeholder="Group"
          controlledValue={newAddressGroup !== undefined ? generateGroupSelectOption(newAddressGroup) : undefined}
          options={Array.from(Array(TOTAL_NUMBER_OF_GROUPS)).map((_, index) => generateGroupSelectOption(index))}
          onValueChange={(newValue) => {
            newValue && generateNewAddress(newValue.value)
          }}
          title="Select group"
          id="group"
        />
      </ExpandableSection>
      <ModalFooterButtons>
        <ModalFooterButton secondary onClick={onModalClose}>
          Cancel
        </ModalFooterButton>
        <ModalFooterButton onClick={onGenerateClick}>Generate</ModalFooterButton>
      </ModalFooterButtons>
    </>
  )
}

const generateGroupSelectOption = (groupNumber: number) => ({ value: groupNumber, label: `Group ${groupNumber}` })

export default NewAddressPage
