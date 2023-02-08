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

import { addressToGroup, getHumanReadableError, TOTAL_NUMBER_OF_GROUPS } from '@alephium/sdk'
import { AddressInfo, Transaction } from '@alephium/sdk/api/explorer'
import { merge } from 'lodash'
import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PartialDeep } from 'type-fest'

import { useAppSelector } from '@/hooks/redux'
import AddressMetadataStorage from '@/persistent-storage/address-metadata'
import { AddressHash, AddressSettings } from '@/types/addresses'
import { NetworkName } from '@/types/network'
import { TimeInMs } from '@/types/numbers'
import { PendingTx } from '@/types/transactions'
import { getRandomLabelColor } from '@/utils/colors'

import { useGlobalContext } from './global'

export class Address {
  readonly hash: AddressHash
  readonly shortHash: string
  readonly publicKey: string
  readonly privateKey: string
  readonly group: number
  readonly index: number

  settings: AddressSettings
  details: AddressInfo
  transactions: {
    confirmed: Transaction[]
    pending: PendingTx[]
    loadedPage: number
  }
  availableBalance: bigint
  lastUsed?: TimeInMs
  network?: NetworkName

  constructor(hash: string, publicKey: string, privateKey: string, index: number, settings: AddressSettings) {
    this.hash = hash
    this.shortHash = `${this.hash.substring(0, 10)}...`
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
    this.availableBalance = BigInt(0)
  }

  getName() {
    return this.settings.label || this.shortHash
  }

  addPendingTransaction(transaction: PendingTx) {
    console.log('🔵 Adding pending transaction sent from address: ', transaction.fromAddress)

    this.transactions.pending.push(transaction)
  }

  updatePendingTransactions() {
    const newPendingTransactions = this.transactions.pending.filter(
      (pendingTx) => !this.transactions.confirmed.find((confirmedTx) => confirmedTx.hash === pendingTx.txId)
    )

    this.transactions.pending = newPendingTransactions

    // Reduce the available balance of the address based on the total amount of pending transactions
    const pendingSweep = this.transactions.pending.find((tx) => tx.type === 'sweep' || tx.type === 'consolidation')
    const totalAmountOfPendingTxs = pendingSweep
      ? this.availableBalance
      : this.transactions.pending.reduce((acc, tx) => (tx.amount ? acc + BigInt(tx.amount) : acc), BigInt(0))
    this.availableBalance = this.availableBalance - totalAmountOfPendingTxs
  }
}

export type AddressesStateMap = Map<AddressHash, Address>

export interface AddressesContextProps {
  addresses: Address[]
  mainAddress?: Address
  setAddress: (address: Address) => void
  updateAddressSettings: (address: Address, settings: AddressSettings) => void
  isLoadingData: boolean
}

export const initialAddressesContext: AddressesContextProps = {
  addresses: [],
  mainAddress: undefined,
  setAddress: () => undefined,
  updateAddressSettings: () => null,
  isLoadingData: false
}

export const AddressesContext = createContext<AddressesContextProps>(initialAddressesContext)

export const AddressesContextProvider: FC<{ overrideContextValue?: PartialDeep<AddressesContextProps> }> = ({
  children,
  overrideContextValue
}) => {
  const { t } = useTranslation()
  const { client, setSnackbarMessage } = useGlobalContext()
  const [activeWallet, network] = useAppSelector((s) => [s.activeWallet, s.network])

  const [addressesState, setAddressesState] = useState<AddressesStateMap>(new Map())
  const [isLoadingData, setIsLoadingData] = useState(false)

  const addressesOfCurrentNetwork = Array.from(addressesState.values()).filter(
    (addressState) => addressState.network === network.name
  )

  const addressesWithPendingSentTxs = addressesOfCurrentNetwork.filter(
    (address) => address.transactions.pending.filter((pendingTx) => pendingTx.network === network.name).length > 0
  )

  const constructMapKey = useCallback((addressHash: AddressHash) => `${addressHash}-${network.name}`, [network.name])

  const updateAddressesState = useCallback(
    (newAddresses: Address[]) => {
      if (newAddresses.length === 0) return
      setAddressesState((prevState) => {
        const newAddressesState = new Map(prevState)
        for (const newAddress of newAddresses) {
          newAddress.network = network.name
          newAddressesState.set(constructMapKey(newAddress.hash), newAddress)
        }
        return newAddressesState
      })

      console.log('✅ Updated addresses state: ', newAddresses)
    },
    [constructMapKey, network.name]
  )

  const setAddress = useCallback(
    (address: Address) => {
      updateAddressesState([address])
    },
    [updateAddressesState]
  )

  const updateAddressSettings = useCallback(
    (address: Address, settings: AddressSettings) => {
      if (!activeWallet.mnemonic) throw new Error('Could not update address settings, mnemonic not found')
      if (!activeWallet.name) throw new Error('Could not update address settings, wallet name not found')

      if (!activeWallet.isPassphraseUsed)
        AddressMetadataStorage.store({
          dataKey: {
            mnemonic: activeWallet.mnemonic,
            walletName: activeWallet.name
          },
          index: address.index,
          settings: {
            ...settings,
            isDefault: settings.isMain,
            color: settings.color ?? getRandomLabelColor()
          }
        })
      address.settings = settings
      setAddress(address)
    },
    [activeWallet.isPassphraseUsed, activeWallet.mnemonic, activeWallet.name, setAddress]
  )

  const displayDataFetchingError = useCallback(
    () =>
      setSnackbarMessage({
        text: t`Could not fetch data because the wallet is offline`,
        type: 'alert',
        duration: 5000
      }),
    [setSnackbarMessage, t]
  )

  const fetchAndStoreAddressesData = useCallback(
    async (addresses: Address[] = [], checkingForPendingTransactions = false) => {
      if (!client || network.status === 'offline') {
        displayDataFetchingError()
        updateAddressesState(addresses)
        return
      }
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
          // await client.fetchAddressDetails(address)
          // await client.fetchAddressConfirmedTransactions(address)

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
            text: getHumanReadableError(
              e,
              t('Error while fetching data for address {{ hash }}', { hash: address.hash })
            ),
            type: 'alert'
          })
        }
      }

      if (shouldUpdate) {
        updateAddressesState(addressesToUpdate)
      }
      setIsLoadingData(false)
    },
    [
      client,
      network.status,
      addressesOfCurrentNetwork,
      displayDataFetchingError,
      updateAddressesState,
      setSnackbarMessage,
      t
    ]
  )

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
  }, [addressesState, network.name, fetchAndStoreAddressesData, addressesOfCurrentNetwork, addressesWithPendingSentTxs])

  return (
    <AddressesContext.Provider
      value={merge(
        {
          addresses: addressesOfCurrentNetwork,
          mainAddress: addressesOfCurrentNetwork.find((address) => address.settings.isMain),
          setAddress,
          updateAddressSettings,
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
