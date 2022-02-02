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
import { createContext, FC, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { PartialDeep } from 'type-fest'

import {
  AddressSettings,
  loadStoredAddressesMetadataOfAccount,
  storeAddressMetadataOfAccount
} from '../utils/addresses'
import { NetworkType } from '../utils/settings'
import { Client, useGlobalContext } from './global'

type TransactionType = 'consolidation' | 'transfer'

type SimpleTx = {
  txId: string
  fromAddress: string
  toAddress: string
  amount: string
  timestamp: number
  type: TransactionType
  network: NetworkType
}

export type AddressHash = string
export type TimeInMs = number

export class Address {
  readonly hash: AddressHash
  readonly publicKey: string
  readonly privateKey: string
  readonly group: number
  readonly index: number
  settings: AddressSettings
  details: AddressInfo
  transactions: {
    confirmed: Transaction[]
    pending: SimpleTx[]
  }
  lastUsed?: TimeInMs
  network?: NetworkType

  constructor(hash: string, publicKey: string, privateKey: string, index: number, settings: AddressSettings) {
    this.hash = hash
    this.publicKey = publicKey
    this.privateKey = privateKey
    this.group = addressToGroup(hash, TOTAL_NUMBER_OF_GROUPS)
    this.index = index
    this.settings = settings
    this.details = {
      balance: '',
      lockedBalance: '',
      txNumber: 0
    }
    this.transactions = {
      confirmed: [],
      pending: []
    }
  }

  async fetchDetails(client: Client) {
    if (!client) return
    console.log('⬇️ Fetching address details: ', this.hash)

    const { data } = await client.explorer.getAddressDetails(this.hash)
    this.details = data

    return data
  }

  async fetchConfirmedTransactions(client: Client, page = 1) {
    if (!client) return []
    console.log('⬇️ Fetching address confirmed transactions: ', this.hash)

    const { data } = await client.explorer.getAddressTransactions(this.hash, page)
    this.transactions.confirmed = data
    this.lastUsed = this.transactions.confirmed.length > 0 ? this.transactions.confirmed[0].timestamp : undefined

    return data
  }

  addPendingTransaction(transaction: SimpleTx) {
    console.log('🔵 Adding pending transaction sent from address: ', transaction.fromAddress)

    this.transactions.pending.push(transaction)
  }

  updatePendingTransactions() {
    const newPendingTransactions = this.transactions.pending.filter(
      (pendingTx) => !this.transactions.confirmed.find((confirmedTx) => confirmedTx.hash === pendingTx.txId)
    )

    this.transactions.pending = newPendingTransactions
  }
}

export type AddressesStateMap = Map<AddressHash, Address>

export interface AddressesContextProps {
  addresses: Address[]
  getAddress: (hash: AddressHash) => Address | undefined
  setAddress: (address: Address) => void
  saveNewAddress: (address: Address) => void
  updateAddressSettings: (address: Address, settings: AddressSettings) => void
  refreshAddressesData: () => void
}

export const initialAddressesContext: AddressesContextProps = {
  addresses: [],
  getAddress: () => undefined,
  setAddress: () => undefined,
  saveNewAddress: () => null,
  updateAddressSettings: () => null,
  refreshAddressesData: () => null
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

  const getAddress = useCallback(
    (addressHash: AddressHash) => addressesState.get(constructMapKey(addressHash)),
    [addressesState, constructMapKey]
  )

  const updateAddressesState = useCallback(
    (newAddresses: Address[]) => {
      setAddressesState((prevState) => {
        const newAddressesState = new Map(prevState)
        for (const newAddress of newAddresses) {
          newAddress.network = currentNetwork
          newAddressesState.set(constructMapKey(newAddress.hash), newAddress)
        }
        return newAddressesState
      })

      console.log('✅ Updated addresses state: ', newAddresses)
    },
    [constructMapKey, currentNetwork]
  )

  const setAddress = useCallback(
    (address: Address) => {
      updateAddressesState([address])
    },
    [updateAddressesState]
  )

  const updateAddressSettings = (address: Address, settings: AddressSettings) => {
    storeAddressMetadataOfAccount(currentUsername, address.index, settings)
    address.settings = settings
    setAddress(address)
  }

  const getAddressesStateForCurrentNetwork = useCallback(() => {
    return Array.from(addressesState.values()).filter((addressState) => addressState.network === currentNetwork)
  }, [addressesState, currentNetwork])

  const fetchAndStoreAddressesData = useCallback(
    async (addresses: Address[] = [], checkingForPendingTransactions = false) => {
      if (!client) return

      const addressesToUpdate: Address[] = []

      // Refresh state for only the specified addresses, otherwise refresh all addresses of the current network
      const addressesStateToRefresh = addresses.length > 0 ? addresses : getAddressesStateForCurrentNetwork()
      console.log('🌈 Fetching addresses data from API: ', addressesStateToRefresh)

      // The state should always update when clicking the "refresh" button, but when checking for pending transactions
      // it should only update when at least one pending transaction has been confirmed.
      let shouldUpdate = !checkingForPendingTransactions

      for (const address of addressesStateToRefresh) {
        await address.fetchDetails(client)
        await address.fetchConfirmedTransactions(client)

        const initialNumberOfPendingTransactions = address.transactions.pending.length

        // Filter pending addresses and remove the ones that are now confirmed
        address.updatePendingTransactions()

        if (
          checkingForPendingTransactions &&
          address.transactions.pending.length !== initialNumberOfPendingTransactions
        ) {
          shouldUpdate = true
        }

        if (shouldUpdate) {
          addressesToUpdate.push(address)
        }
      }

      if (shouldUpdate) {
        updateAddressesState(addressesToUpdate)
      }
    },
    [client, getAddressesStateForCurrentNetwork, updateAddressesState]
  )

  const saveNewAddress = useCallback(
    async (newAddress: Address) => {
      storeAddressMetadataOfAccount(currentUsername, newAddress.index, newAddress.settings)
      await fetchAndStoreAddressesData([newAddress])
    },
    [currentUsername, fetchAndStoreAddressesData]
  )

  // Initialize addresses state using the locally stored address metadata
  useEffect(() => {
    const initializeCurrentNetworkAddresses = async () => {
      console.log('🥇 Initializing current network addresses')
      if (!currentUsername || !wallet) return

      const addressesMetadata = loadStoredAddressesMetadataOfAccount(currentUsername)

      if (addressesMetadata.length === 0) {
        await saveNewAddress(
          new Address(wallet.address, wallet.publicKey, wallet.privateKey, 0, {
            isMain: true,
            label: undefined,
            color: undefined
          })
        )
      } else {
        console.log('👀 Found addresses metadata in local storage')

        const addressesToFetchData = addressesMetadata.map(({ index, ...settings }) => {
          const { address, publicKey, privateKey } = deriveNewAddressData(wallet.seed, undefined, index)
          return new Address(address, publicKey, privateKey, index, settings)
        })
        fetchAndStoreAddressesData(addressesToFetchData)
      }
    }

    if (
      wallet &&
      (addressesState.size === 0 || getAddressesStateForCurrentNetwork().length === 0) &&
      previousClient.current !== client
    ) {
      previousClient.current = client
      initializeCurrentNetworkAddresses()
    }
  }, [
    addressesState.size,
    client,
    currentUsername,
    getAddressesStateForCurrentNetwork,
    fetchAndStoreAddressesData,
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
    const addresses = getAddressesStateForCurrentNetwork()

    const addressesWithPendingSentTransactions = addresses.filter(
      (address) => address.transactions.pending.filter((pendingTx) => pendingTx.network === currentNetwork).length > 0
    )

    // In case the "to" address of a pending transaction is an address of this wallet, we need to query the API for this
    // one as well
    const addressesWithPendingReceivingTransactions = addresses.filter((address) =>
      addressesWithPendingSentTransactions.some((addressWithPendingTx) =>
        addressWithPendingTx.transactions.pending.some((pendingTx) => pendingTx.toAddress === address.hash)
      )
    )

    const addressesToRefresh = [...addressesWithPendingSentTransactions, ...addressesWithPendingReceivingTransactions]

    const interval = setInterval(() => {
      if (addressesToRefresh.length > 0) {
        console.log('❓ Checking if pending transactions are confirmed: ', addressesToRefresh)
        fetchAndStoreAddressesData(addressesToRefresh, true)
      } else {
        clearInterval(interval)
      }
    }, 2000)

    return () => {
      clearInterval(interval)
    }
  }, [addressesState, currentNetwork, fetchAndStoreAddressesData, getAddressesStateForCurrentNetwork])

  return (
    <AddressesContext.Provider
      value={merge(
        {
          addresses: getAddressesStateForCurrentNetwork(),
          getAddress,
          setAddress,
          saveNewAddress,
          updateAddressSettings,
          refreshAddressesData: fetchAndStoreAddressesData
        },
        overrideContextValue as AddressesContextProps
      )}
    >
      {children}
    </AddressesContext.Provider>
  )
}

export const useAddressesContext = () => useContext(AddressesContext)
