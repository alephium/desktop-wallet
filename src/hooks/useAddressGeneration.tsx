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

import { AddressKeyPair, deriveNewAddressData, getWalletFromMnemonic, TOTAL_NUMBER_OF_GROUPS } from '@alephium/sdk'

import client from '@/api/client'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import {
  addressDiscoveryFinished,
  addressDiscoveryStarted,
  addressesRestoredFromMetadata,
  addressRestorationStarted
} from '@/storage/addresses/addressesActions'
import { selectAllAddresses } from '@/storage/addresses/addressesSelectors'
import { saveNewAddresses } from '@/storage/addresses/addressesStorageUtils'
import AddressMetadataStorage from '@/storage/addresses/addressMetadataPersistentStorage'
import { getEncryptedStoragePropsFromActiveWallet } from '@/storage/encryptedPersistentStorage'
import { AddressBase, AddressMetadata } from '@/types/addresses'
import { getInitialAddressSettings } from '@/utils/addresses'
import { getRandomLabelColor } from '@/utils/colors'

interface GenerateAddressProps {
  group?: number
}

interface DiscoverUsedAddressesProps {
  mnemonic?: string
  walletId?: string
  skipIndexes?: number[]
  enableLoading?: boolean
}

interface GenerateOneAddressPerGroupProps {
  labelPrefix?: string
  labelColor?: string
  skipGroups?: number[]
}

const addressDiscoveryWorker = new Worker(new URL('../workers/addressDiscovery.ts', import.meta.url), {
  type: 'module'
})
const deriveAddressesInGroupsWorker = new Worker(new URL('../workers/deriveAddressesInGroups.ts', import.meta.url), {
  type: 'module'
})
const deriveAddressesFromIndexesWorker = new Worker(
  new URL('../workers/deriveAddressesFromIndexes.ts', import.meta.url),
  { type: 'module' }
)

const useAddressGeneration = () => {
  const dispatch = useAppDispatch()
  const addresses = useAppSelector(selectAllAddresses)
  const { mnemonic } = useAppSelector((state) => state.activeWallet)

  const currentAddressIndexes = addresses.map(({ index }) => index)

  const generateAddress = ({ group }: GenerateAddressProps = {}): AddressKeyPair => {
    if (!mnemonic) throw new Error('Could not generate address, mnemonic not found')

    const { masterKey } = getWalletFromMnemonic(mnemonic)

    return deriveNewAddressData(masterKey, group, undefined, currentAddressIndexes)
  }

  const generateAndSaveOneAddressPerGroup = (
    { labelPrefix, labelColor, skipGroups = [] }: GenerateOneAddressPerGroupProps = { skipGroups: [] }
  ) => {
    const groups = Array.from({ length: TOTAL_NUMBER_OF_GROUPS }, (_, group) => group).filter(
      (group) => !skipGroups.includes(group)
    )

    deriveAddressesInGroupsWorker.onmessage = ({ data }: { data: (AddressKeyPair & { group: number })[] }) => {
      const randomLabelColor = getRandomLabelColor()
      const addresses: AddressBase[] = data.map((address) => ({
        ...address,
        isDefault: false,
        label: labelPrefix ? `${labelPrefix} ${address.group}` : '',
        color: labelColor ?? randomLabelColor
      }))

      saveNewAddresses(addresses)
    }

    deriveAddressesInGroupsWorker.postMessage({
      mnemonic,
      groups,
      skipIndexes: currentAddressIndexes
    })
  }

  const restoreAddressesFromMetadata = async () => {
    const { mnemonic, isPassphraseUsed } = getEncryptedStoragePropsFromActiveWallet()
    const addressesMetadata: AddressMetadata[] = isPassphraseUsed ? [] : AddressMetadataStorage.load()

    // When no metadata found (ie, upgrading from a version older then v1.2.0) initialize with default address
    if (addressesMetadata.length === 0) {
      const initialAddressSettings = getInitialAddressSettings()
      AddressMetadataStorage.store({ index: 0, settings: initialAddressSettings })
      addressesMetadata.push({ index: 0, ...initialAddressSettings })
    }

    dispatch(addressRestorationStarted())

    deriveAddressesFromIndexesWorker.onmessage = async ({ data }: { data: AddressKeyPair[] }) => {
      const restoredAddresses: AddressBase[] = data.map((address) => ({
        ...address,
        ...(addressesMetadata.find((metadata) => metadata.index === address.index) as AddressMetadata)
      }))

      dispatch(addressesRestoredFromMetadata(restoredAddresses))
    }

    deriveAddressesFromIndexesWorker.postMessage({
      mnemonic,
      indexesToDerive: addressesMetadata.map((metadata) => metadata.index)
    })
  }

  const discoverAndSaveUsedAddresses = async ({
    mnemonic: mnemonicProp,
    skipIndexes,
    enableLoading = true
  }: DiscoverUsedAddressesProps = {}) => {
    addressDiscoveryWorker.onmessage = ({ data }: { data: AddressKeyPair[] }) => {
      const addresses: AddressBase[] = data.map((address) => ({
        ...address,
        isDefault: false,
        color: getRandomLabelColor()
      }))

      saveNewAddresses(addresses)
      dispatch(addressDiscoveryFinished(enableLoading))
    }

    dispatch(addressDiscoveryStarted(enableLoading))

    addressDiscoveryWorker.postMessage({
      mnemonic: mnemonicProp ?? mnemonic,
      skipIndexes: skipIndexes && skipIndexes.length > 0 ? skipIndexes : currentAddressIndexes,
      clientUrl: client.explorer.baseUrl
    })
  }

  return {
    generateAddress,
    generateAndSaveOneAddressPerGroup,
    restoreAddressesFromMetadata,
    discoverAndSaveUsedAddresses
  }
}

export default useAddressGeneration
