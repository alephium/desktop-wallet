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
import { useCallback, useEffect, useState } from 'react'

import ExpandableSection from '../../components/ExpandableSection'
import ColoredLabelInput from '../../components/Inputs/ColoredLabelInput'
import KeyValueInput from '../../components/Inputs/InlineLabelValueInput'
import Select from '../../components/Inputs/Select'
import Toggle from '../../components/Inputs/Toggle'
import { ModalFooterButton, ModalFooterButtons } from '../../components/Modal'
import HorizontalDivider from '../../components/PageComponents/HorizontalDivider'
import { Section } from '../../components/PageComponents/PageContainers'
import { useGlobalContext } from '../../contexts/global'
import { useModalContext } from '../../contexts/modal'
import { getRandomLabelColor } from '../../utils/colors'

const NewAddressPage = () => {
  const [addressLabel, setAddressLabel] = useState({ title: '', color: getRandomLabelColor() })
  const [isMainAddress, setIsMainAddress] = useState(false)
  const [newAddressData, setNewAddressData] = useState<{ address: string; addressIndex: number }>()
  const [newAddressGroup, setNewAddressGroup] = useState<number>()
  const { wallet, addressesInfo, saveAddressInfo } = useGlobalContext()
  const currentAddressIndexes = addressesInfo.map(({ index }) => index)
  const currentMainAddressInfo = addressesInfo.find(({ isMain }) => isMain)
  const { onModalClose } = useModalContext()

  const generateNewAddress = useCallback(
    (group?: number) => {
      if (wallet?.seed) {
        const data = deriveNewAddressData(wallet.seed, group, undefined, currentAddressIndexes)
        setNewAddressData(data)
        setNewAddressGroup(group || addressToGroup(data.address, TOTAL_NUMBER_OF_GROUPS))
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [wallet]
  )

  useEffect(() => {
    generateNewAddress()
  }, [generateNewAddress])

  const onGenerateClick = () => {
    if (newAddressData) {
      saveAddressInfo({
        index: newAddressData.addressIndex,
        isMain: isMainAddress,
        label: addressLabel.title,
        color: addressLabel.color
      })
      if (isMainAddress && currentMainAddressInfo && currentMainAddressInfo.index !== newAddressData.addressIndex) {
        saveAddressInfo({
          ...currentMainAddressInfo,
          isMain: false
        })
      }
    }
    onModalClose()
  }

  let mainAddressMessage = 'Default address for sending transactions.'

  if (currentMainAddressInfo && wallet?.seed) {
    const { address: currentMainAddress } = deriveNewAddressData(wallet.seed, undefined, currentMainAddressInfo.index)
    mainAddressMessage +=
      currentMainAddressInfo && currentMainAddressInfo.index !== newAddressData?.addressIndex
        ? ` Note that if activated, "${
            currentMainAddressInfo.label || `${currentMainAddress.substring(0, 10)}...`
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
