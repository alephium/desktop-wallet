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

import { AddressInfo, Transaction } from 'alephium-js/dist/api/api-explorer'
import addressToGroup from 'alephium-js/dist/lib/address'
import { TOTAL_NUMBER_OF_GROUPS } from 'alephium-js/dist/lib/constants'
import { deriveNewAddressData } from 'alephium-js/dist/lib/wallet'
import { merge } from 'lodash'
import { createContext, FC, useCallback, useContext, useEffect, useState } from 'react'
import { PartialDeep } from 'type-fest'

import {
  AddressSettings,
  loadStoredAddressesMetadataOfAccount,
  storeAddressMetadataOfAccount
} from '../utils/addresses'
import { useGlobalContext } from './global'

export type AddressHash = string

type AddressState = {
  hash: AddressHash
  publicKey: string
  privateKey: string
  group: number
  index: number
  settings: AddressSettings
  details?: AddressInfo
  transactions?: {
    confirmed: Transaction[]
  }
  lastUsed?: number
}

export type AddressesStateMap = Map<AddressHash, AddressState>

export interface AddressesContextProps {
  saveNewAddress: (address: AddressState) => void
  addressesState: AddressesStateMap
  updateAddressState: (addressState: AddressState) => void
  refreshAddressesDetails: () => void
}

export const initialAddressesContext: AddressesContextProps = {
  saveNewAddress: () => null,
  addressesState: new Map(),
  updateAddressState: () => null,
  refreshAddressesDetails: () => null
}

export const AddressesContext = createContext<AddressesContextProps>(initialAddressesContext)

export const AddressesContextProvider: FC<{ overrideContextValue?: PartialDeep<AddressesContextProps> }> = ({
  children,
  overrideContextValue
}) => {
  const [addressesState, setAddressesState] = useState<AddressesStateMap>(new Map())
  const { currentUsername, wallet, client } = useGlobalContext()

  const updateAddressState = useCallback((newAddressState: AddressState) => {
    setAddressesState((prevState) => {
      const newAddressesState = new Map(prevState)
      newAddressesState.set(newAddressState.hash, newAddressState)
      return newAddressesState
    })
  }, [])

  const fetchAddressDetails = useCallback(
    async (addressHash: AddressHash) => {
      if (!client) return
      const addressDetails = await client.explorer.getAddressDetails(addressHash)
      return addressDetails.data
    },
    [client]
  )

  const fetchAddressConfirmedTransactions = useCallback(
    async (addressHash: string, page = 1) => {
      if (!client) return []
      const addressTransactions = await client.explorer.getAddressTransactions(addressHash, page)
      return addressTransactions.data
    },
    [client]
  )

  const refreshAddressesDetails = async () => {
    const newAddressesState = new Map(addressesState)

    for (const [hash, addressState] of addressesState) {
      const addressDetails = await fetchAddressDetails(hash)
      const addressConfirmedTransactions = await fetchAddressConfirmedTransactions(hash)

      if (addressDetails) {
        newAddressesState.set(hash, {
          ...addressState,
          details: addressDetails,
          transactions: {
            confirmed: addressConfirmedTransactions
          }
        })
      }
    }

    setAddressesState(newAddressesState)
  }

  const saveNewAddress = useCallback(
    async (newAddress: AddressState) => {
      storeAddressMetadataOfAccount(currentUsername, newAddress.index, newAddress.settings)

      let details: AddressInfo | undefined
      let confirmedTransactions: Transaction[] = []
      let lastUsed: number | undefined

      if (!newAddress.details) {
        details = await fetchAddressDetails(newAddress.hash)
      }
      if (!newAddress.transactions?.confirmed) {
        confirmedTransactions = await fetchAddressConfirmedTransactions(newAddress.hash)
        lastUsed = confirmedTransactions.length > 0 ? confirmedTransactions[0].timestamp : undefined
      }
      updateAddressState({
        ...newAddress,
        lastUsed,
        details,
        transactions: {
          confirmed: confirmedTransactions
        }
      })
    },
    [currentUsername, fetchAddressDetails, fetchAddressConfirmedTransactions, updateAddressState]
  )

  useEffect(() => {
    const initializeAddresses = async () => {
      if (!currentUsername || !wallet) return

      const addressesMetadata = loadStoredAddressesMetadataOfAccount(currentUsername)

      if (addressesMetadata.length === 0) {
        await saveNewAddress({
          hash: wallet.address,
          publicKey: wallet.publicKey,
          privateKey: wallet.privateKey,
          group: addressToGroup(wallet.address, TOTAL_NUMBER_OF_GROUPS),
          index: 0,
          settings: {
            isMain: true,
            label: undefined,
            color: undefined
          }
        })
      } else {
        for (const { index, ...settings } of addressesMetadata) {
          const { address, publicKey, privateKey } = deriveNewAddressData(wallet.seed, undefined, index)
          await saveNewAddress({
            hash: address,
            publicKey,
            privateKey,
            group: addressToGroup(address, TOTAL_NUMBER_OF_GROUPS),
            index,
            settings: settings
          })
        }
      }
    }

    initializeAddresses()
  }, [currentUsername, saveNewAddress, wallet])

  // Clean state when locking the wallet
  useEffect(() => {
    if (wallet === undefined) {
      setAddressesState(new Map())
    }
  }, [wallet])

  return (
    <AddressesContext.Provider
      value={merge(
        {
          addressesState,
          saveNewAddress,
          refreshAddressesDetails
        },
        overrideContextValue as AddressesContextProps
      )}
    >
      {children}
    </AddressesContext.Provider>
  )
}

export const useAddressesContext = () => useContext(AddressesContext)
