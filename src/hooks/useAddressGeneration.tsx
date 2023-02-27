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
  addressRestorationStarted,
  selectAllAddresses
} from '@/storage/app-state/slices/addressesSlice'
import AddressMetadataStorage from '@/storage/persistent-storage/addressMetadataPersistentStorage'
import { saveNewAddresses } from '@/storage/storage-utils/addressesStorageUtils'
import { AddressBase, AddressMetadata } from '@/types/addresses'
import { getRandomLabelColor } from '@/utils/colors'

interface GenerateAddressProps {
  group?: number
}

interface DiscoverUsedAddressesProps {
  mnemonic?: string
  walletName?: string
  skipIndexes?: number[]
  enableLoading?: boolean
}

interface RestoreAddressesFromMetadataProps {
  mnemonic: string
  walletName: string
  isPassphraseUsed?: boolean
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
  const { name: walletName, mnemonic } = useAppSelector((state) => state.activeWallet)

  const currentAddressIndexes = addresses.map(({ index }) => index)

  const generateAddress = ({ group }: GenerateAddressProps = {}): AddressKeyPair => {
    if (!mnemonic) throw new Error('Could not generate address, mnemonic not found')

    const { masterKey } = getWalletFromMnemonic(mnemonic)

    return deriveNewAddressData(masterKey, group, undefined, currentAddressIndexes)
  }

  const generateAndSaveOneAddressPerGroup = (
    { labelPrefix, labelColor, skipGroups = [] }: GenerateOneAddressPerGroupProps = { skipGroups: [] }
  ) => {
    if (!mnemonic || !walletName) throw new Error('Could not generate addresses, active wallet not found')

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

      saveNewAddresses(addresses, { walletName, mnemonic })
    }

    deriveAddressesInGroupsWorker.postMessage({
      mnemonic: mnemonic,
      groups,
      skipIndexes: currentAddressIndexes
    })
  }

  const restoreAddressesFromMetadata = async ({
    mnemonic,
    walletName,
    isPassphraseUsed = false
  }: RestoreAddressesFromMetadataProps) => {
    const addressesMetadata: AddressMetadata[] = isPassphraseUsed
      ? []
      : AddressMetadataStorage.load({ mnemonic, walletName })

    if (addressesMetadata.length > 0) {
      dispatch(addressRestorationStarted())

      deriveAddressesFromIndexesWorker.onmessage = async ({ data }: { data: AddressKeyPair[] }) => {
        const restoredAddresses: AddressBase[] = data.map((address) => ({
          ...address,
          ...(addressesMetadata.find((metadata) => metadata.index === address.index) as AddressMetadata)
        }))

        dispatch(addressesRestoredFromMetadata(restoredAddresses))
      }

      deriveAddressesFromIndexesWorker.postMessage({
        mnemonic: mnemonic,
        indexesToDerive: addressesMetadata.map((metadata) => metadata.index)
      })
    }
  }

  const discoverAndSaveUsedAddresses = async ({
    mnemonic: mnemonicProp,
    walletName: walletNameProp,
    skipIndexes,
    enableLoading = true
  }: DiscoverUsedAddressesProps = {}) => {
    const _mnemonic = mnemonicProp ?? mnemonic
    const _walletName = walletNameProp ?? walletName
    if (!_mnemonic || !_walletName) throw new Error('Could not generate addresses, active wallet not found')

    addressDiscoveryWorker.onmessage = ({ data }: { data: AddressKeyPair[] }) => {
      const addresses: AddressBase[] = data.map((address) => ({
        ...address,
        isDefault: false,
        color: getRandomLabelColor()
      }))

      saveNewAddresses(addresses, { walletName: _walletName, mnemonic: _mnemonic })

      dispatch(addressDiscoveryFinished(enableLoading))
    }

    dispatch(addressDiscoveryStarted(enableLoading))

    addressDiscoveryWorker.postMessage({
      mnemonic: _mnemonic,
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
