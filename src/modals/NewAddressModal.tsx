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
  AddressKeyPair,
  addressToGroup,
  deriveNewAddressData,
  getWalletFromMnemonic,
  TOTAL_NUMBER_OF_GROUPS
} from '@alephium/sdk'
import { Info } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import AddressMetadataForm from '@/components/AddressMetadataForm'
import ExpandableSection from '@/components/ExpandableSection'
import InfoBox from '@/components/InfoBox'
import Select, { SelectOption } from '@/components/Inputs/Select'
import { Section } from '@/components/PageComponents/PageContainers'
import { useAddressesContext } from '@/contexts/addresses'
import { useAppSelector } from '@/hooks/redux'
import { saveNewAddresses } from '@/storage-utils/addresses'
import { selectAllAddresses, selectDefaultAddress } from '@/store/addressesSlice'
import { getName } from '@/utils/addresses'
import { getRandomLabelColor } from '@/utils/colors'

import CenteredModal, { ModalFooterButton, ModalFooterButtons } from './CenteredModal'

interface NewAddressModalProps {
  title: string
  onClose: () => void
  singleAddress?: boolean
}

const NewAddressModal = ({ title, onClose, singleAddress }: NewAddressModalProps) => {
  const { t } = useTranslation()
  const { mnemonic, isPassphraseUsed, name: walletName } = useAppSelector((state) => state.activeWallet)
  const addresses = useAppSelector(selectAllAddresses)
  const defaultAddress = useAppSelector(selectDefaultAddress)

  const { generateOneAddressPerGroup } = useAddressesContext()

  const [addressLabel, setAddressLabel] = useState({ title: '', color: isPassphraseUsed ? '' : getRandomLabelColor() })
  const [isDefaultAddress, setIsDefaultAddress] = useState(false)
  const [newAddressData, setNewAddressData] = useState<AddressKeyPair>()
  const [newAddressGroup, setNewAddressGroup] = useState<number>()
  const currentAddressIndexes = useRef(addresses.map(({ index }) => index))

  const generateNewAddress = useCallback(
    (group?: number) => {
      if (!mnemonic) throw new Error('Could not generate address, mnemonic not found')

      const { masterKey } = getWalletFromMnemonic(mnemonic)

      const data = deriveNewAddressData(masterKey, group, undefined, currentAddressIndexes.current)
      setNewAddressData(data)
      setNewAddressGroup(group ?? addressToGroup(data.hash, TOTAL_NUMBER_OF_GROUPS))
    },
    [mnemonic]
  )

  useEffect(() => {
    singleAddress && generateNewAddress()
  }, [generateNewAddress, singleAddress])

  if (!mnemonic || !walletName) return null

  const settings = {
    isDefault: isDefaultAddress,
    color: addressLabel.color,
    label: addressLabel.title
  }

  const onGenerateClick = () => {
    if (newAddressData) {
      saveNewAddresses([{ ...newAddressData, ...settings }], { walletName, mnemonic })
    } else {
      generateOneAddressPerGroup(addressLabel.title, addressLabel.color)
    }
    onClose()
  }

  let defaultAddressMessage = t('Default address for sending transactions.')

  if (defaultAddress) {
    defaultAddressMessage +=
      defaultAddress.index !== newAddressData?.index
        ? ' ' +
          t('Note that if activated, "{{ address }}" will not be the default address anymore.', {
            address: getName(defaultAddress)
          })
        : ''
  }

  function onValueChange(newValue?: SelectOption<number>) {
    if (newValue === undefined) return

    generateNewAddress(newValue.value)
  }

  return (
    <CenteredModal title={title} onClose={onClose}>
      {!isPassphraseUsed && (
        <Section align="flex-start">
          <AddressMetadataForm
            label={addressLabel}
            setLabel={setAddressLabel}
            defaultAddressMessage={defaultAddressMessage}
            isDefault={isDefaultAddress}
            setIsDefault={setIsDefaultAddress}
            isDefaultAddressToggleEnabled
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
        <ModalFooterButton role="secondary" onClick={onClose}>
          {t`Cancel`}
        </ModalFooterButton>
        <ModalFooterButton onClick={onGenerateClick}>{t`Generate`}</ModalFooterButton>
      </ModalFooterButtons>
    </CenteredModal>
  )
}

export default NewAddressModal

const generateGroupSelectOption = (groupNumber: number) => ({ value: groupNumber, label: `Group ${groupNumber}` })
