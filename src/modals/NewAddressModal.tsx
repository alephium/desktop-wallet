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

import { AddressAndKeys, addressToGroup, deriveNewAddressData, TOTAL_NUMBER_OF_GROUPS } from 'alephium-js'
import { Info } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

import AddressMetadataForm from '../components/AddressMetadataForm'
import ExpandableSection from '../components/ExpandableSection'
import InfoBox from '../components/InfoBox'
import Select from '../components/Inputs/Select'
import { Section } from '../components/PageComponents/PageContainers'
import { Address, useAddressesContext } from '../contexts/addresses'
import { useGlobalContext } from '../contexts/global'
import { getRandomLabelColor } from '../utils/colors'
import CenteredModal, { ModalFooterButton, ModalFooterButtons } from './CenteredModal'

interface NewAddressModalProps {
  title: string
  onClose: () => void
  singleAddress?: boolean
}

const NewAddressModal = ({ title, onClose, singleAddress }: NewAddressModalProps) => {
  const [addressLabel, setAddressLabel] = useState({ title: '', color: getRandomLabelColor() })
  const [isMainAddress, setIsMainAddress] = useState(false)
  const [newAddressData, setNewAddressData] = useState<AddressAndKeys>()
  const [newAddressGroup, setNewAddressGroup] = useState<number>()
  const { wallet } = useGlobalContext()
  const { addresses, updateAddressSettings, saveNewAddress, mainAddress, generateOneAddressPerGroup } =
    useAddressesContext()
  const currentAddressIndexes = useRef(addresses.map(({ index }) => index))

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
    singleAddress && generateNewAddress()
  }, [generateNewAddress, singleAddress])

  const onGenerateClick = () => {
    if (newAddressData) {
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
    } else {
      generateOneAddressPerGroup(addressLabel.title, addressLabel.color)
    }
    onClose()
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
    <CenteredModal title={title} onClose={onClose}>
      <Section>
        <AddressMetadataForm
          label={addressLabel}
          setLabel={setAddressLabel}
          mainAddressMessage={mainAddressMessage}
          isMain={isMainAddress}
          setIsMain={setIsMainAddress}
          isMainAddressToggleEnabled
          singleAddress={singleAddress}
        />
        {!singleAddress && (
          <InfoBox Icon={Info} contrast noBorders>
            The group number will be automatically be appended to the addresses’ label.
          </InfoBox>
        )}
      </Section>
      {singleAddress && (
        <ExpandableSection sectionTitleClosed="Advanced options">
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
      )}
      <ModalFooterButtons>
        <ModalFooterButton secondary onClick={onClose}>
          Cancel
        </ModalFooterButton>
        <ModalFooterButton onClick={onGenerateClick}>Generate</ModalFooterButton>
      </ModalFooterButtons>
    </CenteredModal>
  )
}

export default NewAddressModal

const generateGroupSelectOption = (groupNumber: number) => ({ value: groupNumber, label: `Group ${groupNumber}` })
