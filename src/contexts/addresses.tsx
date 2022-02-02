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
import { cloneDeep, merge } from 'lodash'
import { createContext, FC, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { PartialDeep } from 'type-fest'

import {
  AddressSettings,
  loadStoredAddressesMetadataOfAccount,
  storeAddressMetadataOfAccount
} from '../utils/addresses'
import { NetworkType } from '../utils/settings'
import { Client, useGlobalContext } from './global'

export type AddressHash = string

type AddressState = {
  network?: NetworkType
  hash: AddressHash
  publicKey: string
  privateKey: string
  group: number
  index: number
  settings: AddressSettings
  details?: AddressInfo
  transactions: {
    confirmed?: Transaction[]
    pending?: SimpleTx[]
  }
  lastUsed?: number
}

export type AddressesStateMap = Map<AddressHash, AddressState>

export interface AddressesContextProps {
  saveNewAddress: (address: AddressState) => void
  addressesState: AddressesStateMap
  updateAddressState: (addressState: AddressState) => void
  refreshAddressesState: () => void
  addPendingTransaction: (tx: SimpleTx) => void
  getAddressState: (hash: AddressHash) => AddressState | undefined
}

export const initialAddressesContext: AddressesContextProps = {
  saveNewAddress: () => null,
  addressesState: new Map(),
  updateAddressState: () => null,
  refreshAddressesState: () => null,
  addPendingTransaction: () => null,
  getAddressState: () => undefined
}

export type TransactionType = 'consolidation' | 'transfer'

export interface SimpleTx {
  txId: string
  fromAddress: string
  toAddress: string
  amount: string
  timestamp: number
  type?: TransactionType
  network?: NetworkType
}

export const AddressesContext = createContext<AddressesContextProps>(initialAddressesContext)

export const AddressesContextProvider: FC<{ overrideContextValue?: PartialDeep<AddressesContextProps> }> = ({
  children,
  overrideContextValue
}) => {
  const [addressesState, setAddressesState] = useState<AddressesStateMap>(new Map())
  const { currentUsername, wallet, client, currentNetwork } = useGlobalContext()
  const previousClient = useRef<Client>()

  const constructMapKey = useCallback(
    (addressHash: AddressHash) => `${addressHash}-${currentNetwork}`,
    [currentNetwork]
  )

  const getAddressState = useCallback(
    (addressHash: AddressHash) => addressesState.get(constructMapKey(addressHash)),
    [addressesState, constructMapKey]
  )

  const updateAddressState = useCallback(
    (newAddressState: AddressState) => {
      setAddressesState((prevState) => {
        const newAddressesState = new Map(prevState)
        newAddressesState.set(constructMapKey(newAddressState.hash), { ...newAddressState, network: currentNetwork })
        return newAddressesState
      })
      console.log('✅ Updated address state: ', newAddressState.hash)
    },
    [constructMapKey, currentNetwork]
  )

  const fetchAddressDetails = useCallback(
    async (addressHash: AddressHash) => {
      console.log('⬇️ Fetching address details: ', addressHash)
      if (!client) return
      const addressDetails = await client.explorer.getAddressDetails(addressHash)
      return addressDetails.data
    },
    [client]
  )

  const fetchAddressConfirmedTransactions = useCallback(
    async (addressHash: string, page = 1) => {
      console.log('⬇️ Fetching address confirmed transactions: ', addressHash)
      if (!client) return []
      const addressTransactions = await client.explorer.getAddressTransactions(addressHash, page)
      return addressTransactions.data
    },
    [client]
  )

  const addPendingTransaction = (transaction: SimpleTx) => {
    console.log('🔵 Adding pending transaction from address: ', transaction.fromAddress)
    const newAddressState = cloneDeep(getAddressState(transaction.fromAddress))
    if (!newAddressState) return

    !newAddressState.transactions.pending
      ? (newAddressState.transactions.pending = [transaction])
      : newAddressState.transactions.pending.push(transaction)

    updateAddressState(newAddressState)
  }

  const getAddressesStateOfCurrentNetwork = useCallback(() => {
    return Array.from(addressesState.values()).filter((addressState) => addressState.network === currentNetwork)
  }, [addressesState, currentNetwork])

  const refreshAddressesState = useCallback(
    async (addresses: AddressState[] = [], checkingForPendingTransactions = false) => {
      const newAddressesState = new Map(addressesState)

      // Refresh state for only the specified addresses, otherwise refresh all addresses of the current network
      const addressesStateToRefresh = addresses.length > 0 ? addresses : getAddressesStateOfCurrentNetwork()
      console.log('🌈 Refreshing addresses state: ', addressesStateToRefresh)

      // The state should always update when clicking the "refresh" button, but when checking for pending transactions
      // it should only update when at least one pending transaction has been confirmed.
      let shouldUpdate = !checkingForPendingTransactions

      for (const currentAddressState of addressesStateToRefresh) {
        if (currentAddressState) {
          const currentNumberOfPendingTx = currentAddressState.transactions.pending
            ? currentAddressState.transactions.pending.length
            : 0

          const addressDetails = await fetchAddressDetails(currentAddressState.hash)
          const addressConfirmedTransactions = await fetchAddressConfirmedTransactions(currentAddressState.hash)

          // Filter pending addresses and remove the ones that are now confirmed
          const addressPendingTransactions = currentAddressState.transactions.pending
            ? currentAddressState.transactions.pending.filter(
                (pendingTx) => !addressConfirmedTransactions.find((confirmedTx) => confirmedTx.hash === pendingTx.txId)
              )
            : currentAddressState.transactions.pending

          const newNumberOfPendingTx = addressPendingTransactions ? addressPendingTransactions.length : 0

          if (checkingForPendingTransactions && newNumberOfPendingTx !== currentNumberOfPendingTx) {
            shouldUpdate = true
          }

          if (addressDetails) {
            newAddressesState.set(constructMapKey(currentAddressState.hash), {
              ...currentAddressState,
              details: addressDetails,
              transactions: {
                pending: addressPendingTransactions,
                confirmed: addressConfirmedTransactions
              },
              lastUsed: addressConfirmedTransactions.length > 0 ? addressConfirmedTransactions[0].timestamp : undefined
            })
          }
        }
      }

      if (shouldUpdate) {
        setAddressesState(newAddressesState)
        console.log('✅ Updated addresses state: ', newAddressesState)
      }
    },
    [
      addressesState,
      constructMapKey,
      fetchAddressConfirmedTransactions,
      fetchAddressDetails,
      getAddressesStateOfCurrentNetwork
    ]
  )

  const saveNewAddress = useCallback(
    async (newAddress: AddressState) => {
      console.log('🟠 Saving new address: ', newAddress.hash)
      storeAddressMetadataOfAccount(currentUsername, newAddress.index, newAddress.settings)

      let details: AddressInfo | undefined
      let confirmedTransactions = newAddress.transactions.confirmed
      let pendingTransactions = newAddress.transactions.pending
      let lastUsed: number | undefined

      if (!newAddress.details) {
        details = await fetchAddressDetails(newAddress.hash)
      }
      if (!newAddress.transactions.confirmed) {
        confirmedTransactions = await fetchAddressConfirmedTransactions(newAddress.hash)
        lastUsed = confirmedTransactions.length > 0 ? confirmedTransactions[0].timestamp : undefined
      }
      if (!newAddress.transactions.pending) {
        pendingTransactions = []
      }

      updateAddressState({
        ...newAddress,
        lastUsed,
        details,
        transactions: {
          pending: pendingTransactions,
          confirmed: confirmedTransactions
        }
      })
    },
    [currentUsername, fetchAddressDetails, fetchAddressConfirmedTransactions, updateAddressState]
  )

  // Initialize addresses state using the locally stored address metadata
  useEffect(() => {
    const initializeCurrentNetworkAddresses = async () => {
      console.log('🥇 Initializing current network addresses')
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
          },
          transactions: {}
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
            settings: settings,
            transactions: {}
          })
        }
      }
    }

    if (
      wallet &&
      (addressesState.size === 0 || getAddressesStateOfCurrentNetwork().length === 0) &&
      previousClient.current !== client
    ) {
      previousClient.current = client
      initializeCurrentNetworkAddresses()
    }
  }, [
    addressesState,
    client,
    currentNetwork,
    currentUsername,
    getAddressesStateOfCurrentNetwork,
    saveNewAddress,
    wallet
  ])

  // Clean state when locking the wallet
  useEffect(() => {
    if (wallet === undefined) {
      console.log('🧽 Cleaning state.')
      setAddressesState(new Map())
    }
  }, [wallet])

  // Whenever the addresses state updates, check if there are pending transactions on the current network and if so,
  // keep querying the API until all pending transactions are confirmed.
  useEffect(() => {
    const addressesOfCurrentNetwork = Array.from(addressesState.values()).filter(
      (addressState) => addressState.network === currentNetwork
    )

    const addressesWithPendingSentTransactions = addressesOfCurrentNetwork.filter(
      (addressState) =>
        addressState.transactions.pending &&
        addressState.transactions.pending.filter((pendingTx) => pendingTx.network === currentNetwork).length > 0
    )

    // In case the "to" address of a pending transaction is an address of this wallet, we need to query the API for this
    // one as well
    const addressesWithPendingReceivingTransactions = addressesOfCurrentNetwork.filter((addressState) =>
      addressesWithPendingSentTransactions.some((addressWithPendingTx) =>
        addressWithPendingTx.transactions.pending?.some((pendingTx) => pendingTx.toAddress === addressState.hash)
      )
    )

    const addressesToRefresh = [...addressesWithPendingSentTransactions, ...addressesWithPendingReceivingTransactions]

    const interval = setInterval(() => {
      if (addressesToRefresh.length > 0) {
        console.log('❓ Checking if pending transactions are confirmed: ', addressesToRefresh)
        refreshAddressesState(addressesToRefresh, true)
      } else {
        clearInterval(interval)
      }
    }, 2000)

    return () => {
      clearInterval(interval)
    }
  }, [addressesState, currentNetwork, refreshAddressesState])

  return (
    <AddressesContext.Provider
      value={merge(
        {
          addressesState: getAddressesStateOfCurrentNetwork(),
          saveNewAddress,
          refreshAddressesState,
          addPendingTransaction,
          getAddressState
        },
        overrideContextValue as AddressesContextProps
      )}
    >
      {children}
    </AddressesContext.Provider>
  )
}

export const useAddressesContext = () => useContext(AddressesContext)
