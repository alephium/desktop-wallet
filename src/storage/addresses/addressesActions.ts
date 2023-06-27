/*
Copyright 2018 - 2023 The Alephium Authors
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

import { getHumanReadableError } from '@alephium/sdk'
import { explorer } from '@alephium/web3'
import { createAction, createAsyncThunk } from '@reduxjs/toolkit'
import dayjs from 'dayjs'
import { chunk } from 'lodash'

import {
  fetchAddressesData,
  fetchAddressesTransactionsNextPage,
  fetchAddressTransactionsNextPage
} from '@/api/addresses'
import client from '@/api/client'
import i18n from '@/i18n'
import { selectAddressByHash, selectAllAddresses } from '@/storage/addresses/addressesSelectors'
import { RootState } from '@/storage/store'
import { extractNewTransactionHashes, getTransactionsOfAddress } from '@/storage/transactions/transactionsUtils'
import {
  Address,
  AddressBase,
  AddressDataSyncResult,
  AddressHash,
  AddressSettings,
  BalanceHistory,
  LoadingEnabled
} from '@/types/addresses'
import { Contact } from '@/types/contacts'
import { Message, SnackbarMessage } from '@/types/snackbar'
import { CHART_DATE_FORMAT } from '@/utils/constants'

export const loadingStarted = createAction('addresses/loadingStarted')

export const addressesRestoredFromMetadata = createAction<AddressBase[]>('addresses/addressesRestoredFromMetadata')

export const addressRestorationStarted = createAction('addresses/addressRestorationStarted')

export const newAddressesSaved = createAction<AddressBase[]>('addresses/newAddressesSaved')

export const defaultAddressChanged = createAction<Address>('addresses/defaultAddressChanged')

export const addressDiscoveryStarted = createAction<LoadingEnabled>('addresses/addressDiscoveryStarted')

export const addressDiscoveryFinished = createAction<LoadingEnabled>('addresses/addressDiscoveryFinished')

export const addressSettingsSaved = createAction<{ addressHash: AddressHash; settings: AddressSettings }>(
  'addresses/addressSettingsSaved'
)

export const syncAddressesData = createAsyncThunk<
  AddressDataSyncResult[],
  AddressHash[] | undefined,
  { rejectValue: SnackbarMessage }
>('addresses/syncAddressesData', async (payload, { getState, dispatch, rejectWithValue }) => {
  dispatch(loadingStarted())

  const state = getState() as RootState
  const addresses = payload ?? (state.addresses.ids as AddressHash[])

  try {
    return await fetchAddressesData(addresses)
  } catch (e) {
    return rejectWithValue({
      text: getHumanReadableError(e, i18n.t("Encountered error while synching your addresses' data.")),
      type: 'alert'
    })
  }
})

export const syncAddressTransactionsNextPage = createAsyncThunk(
  'addresses/syncAddressTransactionsNextPage',
  async (payload: AddressHash, { getState, dispatch }) => {
    dispatch(loadingStarted())

    const state = getState() as RootState
    const address = selectAddressByHash(state, payload)

    if (!address) return

    return await fetchAddressTransactionsNextPage(address)
  }
)

export const syncAllAddressesTransactionsNextPage = createAsyncThunk(
  'addresses/syncAllAddressesTransactionsNextPage',
  async (_, { getState, dispatch }): Promise<{ pageLoaded: number; transactions: explorer.Transaction[] }> => {
    dispatch(loadingStarted())

    const state = getState() as RootState
    const addresses = selectAllAddresses(state)

    let nextPageToLoad = state.confirmedTransactions.pageLoaded + 1
    let newTransactionsFound = false
    let transactions: explorer.Transaction[] = []

    while (!newTransactionsFound) {
      // NOTE: Explorer backend limits this query to 80 addresses
      const results = await Promise.all(
        chunk(addresses, 80).map((addressesChunk) => fetchAddressesTransactionsNextPage(addressesChunk, nextPageToLoad))
      )

      transactions = results.flat()

      if (transactions.length === 0) break

      newTransactionsFound = addresses.some((address) => {
        const transactionsOfAddress = getTransactionsOfAddress(transactions, address)
        const newTxHashes = extractNewTransactionHashes(transactionsOfAddress, address.transactions)

        return newTxHashes.length > 0
      })

      nextPageToLoad += 1
    }

    return { pageLoaded: nextPageToLoad - 1, transactions }
  }
)

export const syncAddressesHistoricBalances = createAsyncThunk(
  'addresses/syncAddressesHistoricBalances',
  async (
    payload: AddressHash[] | undefined,
    { getState }
  ): Promise<
    {
      address: AddressHash
      balances: BalanceHistory[]
    }[]
  > => {
    const now = dayjs()
    const thisMoment = now.valueOf()
    const oneYearAgo = now.subtract(12, 'month').valueOf()

    const addressesBalances = []
    const state = getState() as RootState

    const addresses = payload ?? (state.addresses.ids as AddressHash[])

    for (const addressHash of addresses) {
      const balances = []
      const data = await client.explorer.addresses.getAddressesAddressAmountHistory(
        addressHash,
        { fromTs: oneYearAgo, toTs: thisMoment, 'interval-type': explorer.IntervalType.Daily },
        { format: 'text' }
      )

      try {
        const { amountHistory } = JSON.parse(data)

        for (const [timestamp, balance] of amountHistory) {
          balances.push({
            date: dayjs(timestamp).format(CHART_DATE_FORMAT),
            balance: BigInt(balance).toString()
          })
        }
      } catch (e) {
        console.error('Could not parse amount history data', e)
      }

      addressesBalances.push({
        address: addressHash,
        balances
      })
    }

    return addressesBalances
  }
)

export const contactStoredInPersistentStorage = createAction<Contact>('contacts/contactStoredInPersistentStorage')

export const contactsLoadedFromPersistentStorage = createAction<Contact[]>(
  'contacts/contactsLoadedFromPersistentStorage'
)

export const contactDeletedFromPeristentStorage = createAction<Contact['id']>(
  'contacts/contactDeletedFromPeristentStorage'
)

export const contactStorageFailed = createAction<Message>('contacts/contactStorageFailed')

export const contactDeletionFailed = createAction<Message>('contacts/contactDeletionFailed')
