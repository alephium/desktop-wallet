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

import { TimeInMs } from '../types/numbers'
import {
  AddressSettings,
  loadStoredAddressesMetadataOfAccount,
  storeAddressMetadataOfAccount
} from '../utils/addresses'
import { getHumanReadableError } from '../utils/api'
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
    loadedPage: number
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
      pending: [],
      loadedPage: 0
    }
  }

  displayName() {
    return this.settings.label || this.shortHash()
  }

  shortHash() {
    return `${this.hash.substring(0, 10)}...`
  }

  labelDisplay() {
    return `${this.settings.isMain ? '★ ' : ''}${this.displayName()}`
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
    console.log(`⬇️ Fetching page ${page} of address confirmed transactions: `, this.hash)

    const { data } = await client.explorer.getAddressTransactions(this.hash, page)

    const isInitialData = page === 1 && data.length > 0 && this.transactions.confirmed.length === 0
    const latestTxHashIsNew =
      page === 1 &&
      data.length > 0 &&
      this.transactions.confirmed.length > 0 &&
      data[0].hash !== this.transactions.confirmed[0].hash

    if (isInitialData) {
      this.transactions.confirmed = data
      this.transactions.loadedPage = 1
    } else if (latestTxHashIsNew || page > 1) {
      const newTransactions = data.filter(
        (tx) => !this.transactions.confirmed.find((confirmedTx) => confirmedTx.hash === tx.hash)
      )
      this.transactions.confirmed =
        page > 1
          ? this.transactions.confirmed.concat(newTransactions)
          : newTransactions.concat(this.transactions.confirmed)
      if (page > 1) {
        this.transactions.loadedPage = page
      }
    }

    this.lastUsed = this.transactions.confirmed.length > 0 ? this.transactions.confirmed[0].timestamp : this.lastUsed

    return data
  }

  async fetchConfirmedTransactionsNextPage(client: Client) {
    if (!client) return []
    await this.fetchConfirmedTransactions(client, this.transactions.loadedPage + 1)
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
  mainAddress?: Address
  getAddress: (hash: AddressHash) => Address | undefined
  setAddress: (address: Address) => void
  saveNewAddress: (address: Address) => void
  updateAddressSettings: (address: Address, settings: AddressSettings) => void
  refreshAddressesData: () => void
  fetchAddressTransactionsNextPage: (address: Address) => void
  isLoadingData: boolean
}

export const initialAddressesContext: AddressesContextProps = {
  addresses: [],
  mainAddress: undefined,
  getAddress: () => undefined,
  setAddress: () => undefined,
  saveNewAddress: () => null,
  updateAddressSettings: () => null,
  refreshAddressesData: () => null,
  fetchAddressTransactionsNextPage: () => null,
  isLoadingData: false
}

export const AddressesContext = createContext<AddressesContextProps>(initialAddressesContext)

export const AddressesContextProvider: FC<{ overrideContextValue?: PartialDeep<AddressesContextProps> }> = ({
  children,
  overrideContextValue
}) => {
  const [addressesState, setAddressesState] = useState<AddressesStateMap>(new Map())
  const [isLoadingData, setIsLoadingData] = useState(false)
  const { currentUsername, wallet, client, currentNetwork, setSnackbarMessage } = useGlobalContext()
  const previousClient = useRef<Client>()
  const addressesOfCurrentNetwork = Array.from(addressesState.values()).filter(
    (addressState) => addressState.network === currentNetwork
  )
  const addressesWithPendingSentTxs = addressesOfCurrentNetwork.filter(
    (address) => address.transactions.pending.filter((pendingTx) => pendingTx.network === currentNetwork).length > 0
  )

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
      if (newAddresses.length === 0) return
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

  const fetchAndStoreAddressesData = useCallback(
    async (addresses: Address[] = [], checkingForPendingTransactions = false) => {
      if (!client) return
      setIsLoadingData(true)

      const addressesToUpdate: Address[] = []

      // Refresh state for only the specified addresses, otherwise refresh all addresses of the current network
      const addressesStateToRefresh = addresses.length > 0 ? addresses : addressesOfCurrentNetwork
      console.log('🌈 Fetching addresses data from API: ', addressesStateToRefresh)

      // The state should always update when clicking the "refresh" button, but when checking for pending transactions
      // it should only update when at least one pending transaction has been confirmed.
      let shouldUpdate = !checkingForPendingTransactions

      for (const address of addressesStateToRefresh) {
        try {
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
        } catch (e) {
          setSnackbarMessage({
            text: getHumanReadableError(e, `Error while fetching data for address ${address.hash}`),
            type: 'alert'
          })
        }
      }

      if (shouldUpdate) {
        updateAddressesState(addressesToUpdate)
      }
      setIsLoadingData(false)
    },
    [client, addressesOfCurrentNetwork, setSnackbarMessage, updateAddressesState]
  )

  const fetchAddressTransactionsNextPage = async (address: Address) => {
    if (!client) return
    setIsLoadingData(true)
    await address.fetchConfirmedTransactionsNextPage(client)
    setIsLoadingData(false)
  }

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
      (addressesState.size === 0 || addressesOfCurrentNetwork.length === 0) &&
      previousClient.current !== client
    ) {
      previousClient.current = client
      initializeCurrentNetworkAddresses()
    }
  }, [
    addressesState.size,
    client,
    currentUsername,
    addressesOfCurrentNetwork,
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
    // In case the "to" address of a pending transaction is an address of this wallet, we need to query the API for this
    // one as well
    const addressesWithPendingReceivingTxs = addressesOfCurrentNetwork.filter((address) =>
      addressesWithPendingSentTxs.some((addressWithPendingTx) =>
        addressWithPendingTx.transactions.pending.some((pendingTx) => pendingTx.toAddress === address.hash)
      )
    )

    const addressesToRefresh = [...addressesWithPendingSentTxs, ...addressesWithPendingReceivingTxs]

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
  }, [
    addressesState,
    currentNetwork,
    fetchAndStoreAddressesData,
    addressesOfCurrentNetwork,
    addressesWithPendingSentTxs
  ])

  return (
    <AddressesContext.Provider
      value={merge(
        {
          addresses: addressesOfCurrentNetwork,
          mainAddress: addressesOfCurrentNetwork.find((address) => address.settings.isMain),
          getAddress,
          setAddress,
          saveNewAddress,
          updateAddressSettings,
          refreshAddressesData: fetchAndStoreAddressesData,
          fetchAddressTransactionsNextPage,
          isLoadingData: isLoadingData || addressesWithPendingSentTxs.length > 0
        },
        overrideContextValue as AddressesContextProps
      )}
    >
      {children}
    </AddressesContext.Provider>
  )
}

export const useAddressesContext = () => useContext(AddressesContext)
