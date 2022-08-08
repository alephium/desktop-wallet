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
  addressToGroup,
  deriveNewAddressData,
  getHumanReadableError,
  TOTAL_NUMBER_OF_GROUPS,
  Wallet
} from '@alephium/sdk'
import { AddressInfo, Transaction } from '@alephium/sdk/api/explorer'
import { merge } from 'lodash'
import { createContext, FC, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PartialDeep } from 'type-fest'

import { TimeInMs } from '../types/numbers'
import { AddressSettings, loadStoredAddressesMetadataOfWallet, storeAddressMetadataOfWallet } from '../utils/addresses'
import { NetworkName } from '../utils/settings'
import { useGlobalContext } from './global'

export type TransactionDirection = 'out' | 'in' | 'pending'
export type TransactionType = 'consolidation' | 'transfer' | 'sweep'

export interface SimpleTx {
  txId: string
  fromAddress: string
  toAddress: string
  timestamp: number
  type: TransactionType
  network: NetworkName
  amount?: bigint
}

export type AddressHash = string

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
    pending: SimpleTx[]
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
    this.availableBalance = 0n
  }

  getName() {
    return this.settings.label || this.shortHash
  }

  getLabelName(showStar = true) {
    return `${this.settings.isMain && showStar ? '★ ' : ''}${this.getName()}`
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
  getAddress: (hash: AddressHash) => Address | undefined
  setAddress: (address: Address) => void
  saveNewAddress: (address: Address) => void
  updateAddressSettings: (address: Address, settings: AddressSettings) => void
  refreshAddressesData: () => void
  fetchAddressTransactionsNextPage: (address: Address) => void
  generateOneAddressPerGroup: (labelPrefix?: string, color?: string, skipGroups?: number[]) => void
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
  generateOneAddressPerGroup: () => null,
  isLoadingData: false
}

export const AddressesContext = createContext<AddressesContextProps>(initialAddressesContext)

export const AddressesContextProvider: FC<{ overrideContextValue?: PartialDeep<AddressesContextProps> }> = ({
  children,
  overrideContextValue
}) => {
  const { t } = useTranslation('App')
  const [addressesState, setAddressesState] = useState<AddressesStateMap>(new Map())
  const [isLoadingData, setIsLoadingData] = useState(false)
  const {
    activeWalletName,
    wallet,
    client,
    currentNetwork,
    setSnackbarMessage,
    settings: {
      network: { nodeHost, explorerApiHost }
    },
    networkStatus,
    isPassphraseUsed
  } = useGlobalContext()
  const previousWallet = useRef<Wallet | undefined>(wallet)
  const previousNodeApiHost = useRef<string>()
  const previousExplorerApiHost = useRef<string>()
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

  const updateAddressSettings = useCallback(
    (address: Address, settings: AddressSettings) => {
      if (!wallet) return

      if (!isPassphraseUsed)
        storeAddressMetadataOfWallet(
          {
            mnemonic: wallet.mnemonic,
            walletName: activeWalletName
          },
          address.index,
          settings
        )
      address.settings = settings
      setAddress(address)
    },
    [wallet, activeWalletName, isPassphraseUsed, setAddress]
  )

  const fetchAndStoreAddressesData = useCallback(
    async (addresses: Address[] = [], checkingForPendingTransactions = false) => {
      if (!client) {
        setSnackbarMessage({
          text: t`Could not fetch data because the wallet is offline`,
          type: 'alert',
          duration: 5000
        })
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
          await client.fetchAddressDetails(address)
          await client.fetchAddressConfirmedTransactions(address)

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
    [client, addressesOfCurrentNetwork, setSnackbarMessage, updateAddressesState, t]
  )

  const fetchAddressTransactionsNextPage = async (address: Address) => {
    if (!client) return
    setIsLoadingData(true)
    await client.fetchAddressConfirmedTransactionsNextPage(address)
    setIsLoadingData(false)
  }

  const saveNewAddress = useCallback(
    (newAddress: Address) => {
      if (!wallet) return

      if (!isPassphraseUsed)
        storeAddressMetadataOfWallet(
          {
            mnemonic: wallet.mnemonic,
            walletName: activeWalletName
          },
          newAddress.index,
          newAddress.settings
        )
      setAddress(newAddress)
      fetchAndStoreAddressesData([newAddress])
    },
    [wallet, isPassphraseUsed, activeWalletName, setAddress, fetchAndStoreAddressesData]
  )

  const generateOneAddressPerGroup = (labelPrefix?: string, labelColor?: string, skipGroups: number[] = []) => {
    if (!wallet?.seed) return

    const skipAddressIndexes = addressesOfCurrentNetwork.map(({ index }) => index)
    const hasLabel = !!labelPrefix && !!labelColor
    Array.from({ length: TOTAL_NUMBER_OF_GROUPS }, (_, group) => group)
      .filter((group) => !skipGroups.includes(group))
      .map((group) => ({ ...deriveNewAddressData(wallet.seed, group, undefined, skipAddressIndexes), group }))
      .forEach((address) => {
        saveNewAddress(
          new Address(address.address, address.publicKey, address.privateKey, address.addressIndex, {
            isMain: false,
            label: hasLabel ? `${labelPrefix} ${address.group}` : '',
            color: hasLabel ? labelColor : ''
          })
        )
      })
  }

  // Initialize addresses state using the locally stored address metadata
  useEffect(() => {
    const initializeCurrentNetworkAddresses = async () => {
      console.log('🥇 Initializing current network addresses')
      if (!activeWalletName || !wallet) return

      const addressesMetadata = isPassphraseUsed
        ? []
        : loadStoredAddressesMetadataOfWallet({
            mnemonic: wallet.mnemonic,
            walletName: activeWalletName
          })

      if (addressesMetadata.length === 0) {
        saveNewAddress(
          new Address(wallet.address, wallet.publicKey, wallet.privateKey, 0, {
            isMain: isPassphraseUsed ? false : true,
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
        updateAddressesState(addressesToFetchData)
        fetchAndStoreAddressesData(addressesToFetchData)
      }
    }

    const walletHasChanged = previousWallet.current !== wallet
    const networkSettingsHaveChanged =
      previousNodeApiHost.current !== nodeHost || previousExplorerApiHost.current !== explorerApiHost

    if (networkStatus === 'connecting' || networkStatus === 'uninitialized') return

    // Clean state when locking the wallet or changing wallets
    if (wallet === undefined || wallet !== previousWallet.current) {
      console.log('🧽 Cleaning state.')
      setAddressesState(new Map())
      previousWallet.current = wallet
    }

    if (wallet && (client === undefined || walletHasChanged || networkSettingsHaveChanged)) {
      previousWallet.current = wallet
      previousNodeApiHost.current = nodeHost
      previousExplorerApiHost.current = explorerApiHost
      initializeCurrentNetworkAddresses()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentNetwork, networkStatus, client, activeWalletName, wallet, explorerApiHost, nodeHost])

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
          generateOneAddressPerGroup,
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
