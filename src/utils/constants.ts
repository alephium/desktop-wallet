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

import { BILLION } from '@alephium/sdk'

export const MINIMAL_GAS_AMOUNT = 20000
export const MINIMAL_GAS_PRICE = BigInt(BILLION * 100) // 100 nanoALPH for the first year to prevent DoS attacks
export const GENESIS_TIMESTAMP = 1231006505000

export enum WALLETCONNECT_ERRORS {
  TRANSACTION_SEND_FAILED = -32000,
  PARSING_SESSION_REQUEST_FAILED = -33000
}
