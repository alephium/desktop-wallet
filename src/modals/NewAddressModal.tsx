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

import {
  AddressAndKeys,
  addressToGroup,
  deriveNewAddressData,
  getWalletFromMnemonic,
  TOTAL_NUMBER_OF_GROUPS
} from '@alephium/sdk'
import { Info } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import AddressMetadataForm from '../components/AddressMetadataForm'
import ExpandableSection from '../components/ExpandableSection'
import InfoBox from '../components/InfoBox'
import Select, { SelectOption } from '../components/Inputs/Select'
import { Section } from '../components/PageComponents/PageContainers'
import { Address, useAddressesContext } from '../contexts/addresses'
import { useGlobalContext } from '../contexts/global'
import { useAppSelector } from '../hooks/redux'
import { getRandomLabelColor } from '../utils/colors'
import CenteredModal, { ModalFooterButton, ModalFooterButtons } from './CenteredModal'

interface NewAddressModalProps {
  title: string
  onClose: () => void
  singleAddress?: boolean
}

const NewAddressModal = ({ title, onClose, singleAddress }: NewAddressModalProps) => {
  const { isPassphraseUsed } = useGlobalContext()
  const [addressLabel, setAddressLabel] = useState({ title: '', color: isPassphraseUsed ? '' : getRandomLabelColor() })
  const [isMainAddress, setIsMainAddress] = useState(false)
  const [newAddressData, setNewAddressData] = useState<AddressAndKeys>()
  const [newAddressGroup, setNewAddressGroup] = useState<number>()
  const { addresses, updateAddressSettings, saveNewAddress, mainAddress, generateOneAddressPerGroup } =
    useAddressesContext()
  const currentAddressIndexes = useRef(addresses.map(({ index }) => index))
  const { t } = useTranslation('App')
  const activeWalletMnemonic = useAppSelector((state) => state.activeWallet.mnemonic)

  const generateNewAddress = useCallback(
    (group?: number) => {
      if (!activeWalletMnemonic) throw new Error('Could not generate address, mnemonic not found')

      const { masterKey } = getWalletFromMnemonic(activeWalletMnemonic)

      const data = deriveNewAddressData(masterKey, group, undefined, currentAddressIndexes.current)
      setNewAddressData(data)
      setNewAddressGroup(group ?? addressToGroup(data.address, TOTAL_NUMBER_OF_GROUPS))
    },
    [activeWalletMnemonic]
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

  let mainAddressMessage = t`Default address for sending transactions.`

  if (mainAddress) {
    const address = mainAddress.settings.label || `${mainAddress.hash.substring(0, 10)}...`
    mainAddressMessage +=
      mainAddress.index !== newAddressData?.addressIndex
        ? ' ' + t('Note that if activated, "{{ address }}" will not be the default address anymore.', { address })
        : ''
  }

  function onValueChange(newValue?: SelectOption<number>) {
    if (newValue === undefined) return

    generateNewAddress(newValue.value)
  }

  return (
    <CenteredModal title={title} onClose={onClose}>
      {!isPassphraseUsed && (
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
              {t`The group number will be automatically be appended to the addresses’ label.`}
            </InfoBox>
          )}
        </Section>
      )}
      {isPassphraseUsed && singleAddress && (
        <InfoBox contrast noBorders>
          {t`By default, the address is generated in a random group. You can select the group you want the address to be generated in using the Advanced options.`}
        </InfoBox>
      )}
      {singleAddress && (
        <ExpandableSection sectionTitleClosed={t`Advanced options`}>
          <Select
            label={t`Group`}
            controlledValue={newAddressGroup !== undefined ? generateGroupSelectOption(newAddressGroup) : undefined}
            options={Array.from(Array(TOTAL_NUMBER_OF_GROUPS)).map((_, index) => generateGroupSelectOption(index))}
            onValueChange={onValueChange}
            title={t`Select group`}
            id="group"
          />
        </ExpandableSection>
      )}
      <ModalFooterButtons>
        <ModalFooterButton secondary onClick={onClose}>
          {t`Cancel`}
        </ModalFooterButton>
        <ModalFooterButton onClick={onGenerateClick}>{t`Generate`}</ModalFooterButton>
      </ModalFooterButtons>
    </CenteredModal>
  )
}

export default NewAddressModal

const generateGroupSelectOption = (groupNumber: number) => ({ value: groupNumber, label: `Group ${groupNumber}` })
