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
import { createAction, createAsyncThunk } from '@reduxjs/toolkit'

import { fetchCsv } from '@/api/transactions'
import i18n from '@/i18n'
import { Message, SnackbarMessage } from '@/types/snackbar'
import { CsvExportQueryParams, PendingTransaction } from '@/types/transactions'

export const transactionBuildFailed = createAction<Message>('tx/transactionBuildFailed')

export const transactionSendFailed = createAction<Message>('tx/transactionSendFailed')

export const transactionsSendSucceeded = createAction<{ nbOfTransactionsSent: number }>('tx/transactionsSendSucceeded')

export const transactionSent = createAction<PendingTransaction>('tx/transactionSent')

export const csvFileGenerationStarted = createAction('tx/csvFileGenerationStarted')

export const csvFileGenerationFinished = createAction('tx/csvFileGenerationFinished')

export const fetchTransactionsCsv = createAsyncThunk<string, CsvExportQueryParams, { rejectValue: SnackbarMessage }>(
  'tx/fetchTransactionsCsv',
  async (queryParams: CsvExportQueryParams, { dispatch, rejectWithValue }) => {
    dispatch(csvFileGenerationStarted())

    try {
      return await fetchCsv(queryParams)
    } catch (e) {
      return rejectWithValue({
        text: getHumanReadableError(e, i18n.t('Encountered error while exporting your transactions.')),
        type: 'alert'
      })
    }
  }
)

export const storedPendingTransactionsLoaded = createAction<PendingTransaction[]>('tx/storedPendingTransactionsLoaded')

export const loadingPendingTransactionsFailed = createAction('tx/loadingPendingTransactionsFailed')
