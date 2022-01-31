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

import { AddressInfo } from 'alephium-js/dist/api/api-explorer'
import addressToGroup from 'alephium-js/dist/lib/address'
import { TOTAL_NUMBER_OF_GROUPS } from 'alephium-js/dist/lib/constants'
import { deriveNewAddressData } from 'alephium-js/dist/lib/wallet'
import { merge } from 'lodash'
import { createContext, FC, useCallback, useContext, useEffect, useState } from 'react'
import { PartialDeep } from 'type-fest'

import {
  AddressSettings,
  loadStoredAddressesIndexAndSettingsOfAccount,
  storeAddressIndexAndSettingsOfAccount
} from '../utils/addresses'
import { useGlobalContext } from './global'

export interface AddressesContextProps {
  saveNewAddress: (address: AddressState) => void
  addressesState: Map<string, AddressState>
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

interface AddressState {
  hash: string
  publicKey: string
  privateKey: string
  group: number
  index: number
  settings: AddressSettings
  details?: AddressInfo
}

export const AddressesContextProvider: FC<{ overrideContextValue?: PartialDeep<AddressesContextProps> }> = ({
  children,
  overrideContextValue
}) => {
  const [addressesState, setAddressesState] = useState<Map<string, AddressState>>(new Map())
  const { currentUsername, wallet, client } = useGlobalContext()

  const updateAddressState = useCallback((newAddressState: AddressState) => {
    setAddressesState((prevState) => {
      const newAddressesState = new Map(prevState)
      newAddressesState.set(newAddressState.hash, newAddressState)
      console.log('updating state of address: ', newAddressState.hash)
      return newAddressesState
    })
  }, [])

  const fetchAddressDetails = useCallback(
    async (addressHash: string) => {
      if (!client) return
      const addressDetails = await client.explorer.getAddressDetails(addressHash)
      return addressDetails.data
    },
    [client]
  )

  const refreshAddressesDetails = async () => {
    const newAddressesState = new Map(addressesState)
    for (const [hash, addressState] of addressesState) {
      const addressDetails = await fetchAddressDetails(hash)
      if (addressDetails) {
        newAddressesState.set(hash, { ...addressState, details: addressDetails })
      }
    }
    setAddressesState(newAddressesState)
  }

  const saveNewAddress = useCallback(
    async (newAddress: AddressState) => {
      storeAddressIndexAndSettingsOfAccount(currentUsername, newAddress.index, newAddress.settings)

      if (!newAddress.details) {
        const addressDetails = await fetchAddressDetails(newAddress.hash)
        updateAddressState({ ...newAddress, details: addressDetails })
      } else {
        updateAddressState(newAddress)
      }
    },
    [currentUsername, fetchAddressDetails, updateAddressState]
  )

  useEffect(() => {
    const initializeAddresses = async () => {
      if (!currentUsername || !wallet) return

      const addressesIndexAndSettings = loadStoredAddressesIndexAndSettingsOfAccount(currentUsername)

      if (addressesIndexAndSettings.length === 0) {
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
        for (const { index, ...settings } of addressesIndexAndSettings) {
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
