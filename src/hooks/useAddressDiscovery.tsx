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

import { AddressKeyPair } from '@alephium/sdk'

import { Address, useAddressesContext } from '../contexts/addresses'
import { useGlobalContext } from '../contexts/global'
import { addressDiscoveryFinished, addressDiscoveryStarted } from '../store/actions'
import { useAppDispatch } from './redux'

const addressDiscoveryWorker = new Worker(new URL('../workers/addressDiscovery.ts', import.meta.url), {
  type: 'module'
})

const useAddressDiscovery = (enableLoading = true) => {
  const { client } = useGlobalContext()
  const { addresses, saveNewAddress } = useAddressesContext()
  const dispatch = useAppDispatch()

  const discoverAndSaveActiveAddresses = async (mnemonic: string, skipIndexes?: number[]) => {
    if (!client) throw new Error('Could not discover active addresses, client not found')

    addressDiscoveryWorker.onmessage = ({ data }: { data: AddressKeyPair[] }) => {
      data.forEach(({ hash, publicKey, privateKey, index }) =>
        saveNewAddress(
          new Address(hash, publicKey, privateKey, index, {
            isMain: false,
            label: '',
            color: ''
          }),
          mnemonic
        )
      )

      dispatch(addressDiscoveryFinished(enableLoading))
      addressDiscoveryWorker.terminate()
    }

    dispatch(addressDiscoveryStarted(enableLoading))

    addressDiscoveryWorker.postMessage({
      mnemonic,
      skipIndexes: skipIndexes && skipIndexes.length > 0 ? skipIndexes : addresses.map((address) => address.index),
      clientUrl: client.explorer.baseUrl
    })
  }

  return discoverAndSaveActiveAddresses
}

export default useAddressDiscovery
