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

import { createAction } from '@reduxjs/toolkit'

export type Message = string
export type OptionalMessage = string | undefined

export const languageChangeStarted = createAction('app/languageChangeStarted')
export const languageChangeFinished = createAction('app/languageChangeFinished')
export const copiedToClipboard = createAction<OptionalMessage>('app/copiedToClipboard')
export const copyToClipboardFailed = createAction<OptionalMessage>('app/copyToClipboardFailed')
export const passwordValidationFailed = createAction('app/passwordValidationFailed')

export const transactionBuildFailed = createAction<Message>('tx/transactionBuildFailed')
export const transactionSendFailed = createAction<Message>('tx/transactionSendFailed')
export const transactionsSendSucceeded = createAction<{ nbOfTransactionsSent: number }>('tx/transactionsSendSucceeded')

export const walletCreationFailed = createAction<Message>('wallet/walletCreationFailed')
