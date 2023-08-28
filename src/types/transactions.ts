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

import { AssetAmount, TransactionDirection, TransactionInfoAsset, TransactionInfoType } from '@alephium/sdk'
import { explorer, node } from '@alephium/web3'

import { Address, AddressHash } from '@/types/addresses'

export enum TxType {
  TRANSFER,
  DEPLOY_CONTRACT,
  SIGN_UNSIGNED_TX,
  SCRIPT
}

export type PendingTxType = 'consolidation' | 'transfer' | 'sweep' | 'contract'

export type PendingTransaction = {
  hash: string
  fromAddress: string
  toAddress: string
  timestamp: number
  type: PendingTxType
  amount?: string
  tokens?: explorer.Token[]
  lockTime?: number
  status: 'pending'
}

export type DappTxData = TransferTxData | DeployContractTxData | CallContractTxData | SignUnsignedTxData

export type TxDataToModalType =
  | {
      modalType: TxType.TRANSFER
      txData: TransferTxData
    }
  | {
      modalType: TxType.DEPLOY_CONTRACT
      txData: DeployContractTxData
    }
  | {
      modalType: TxType.SIGN_UNSIGNED_TX
      txData: SignUnsignedTxData
    }
  | {
      modalType: TxType.SCRIPT
      txData: CallContractTxData
    }

export interface DeployContractTxData {
  fromAddress: Address
  bytecode: string

  initialAlphAmount?: AssetAmount
  issueTokenAmount?: string
  gasAmount?: number
  gasPrice?: string
}

export interface CallContractTxData {
  fromAddress: Address
  bytecode: string

  assetAmounts?: AssetAmount[]
  gasAmount?: number
  gasPrice?: string
}

export interface TransferTxData {
  fromAddress: Address
  toAddress: string
  assetAmounts: AssetAmount[]
  gasAmount?: number
  gasPrice?: string
  lockTime?: Date
}

export interface SignUnsignedTxData {
  fromAddress: Address
  unsignedTx: string
}

export interface TxPreparation {
  fromAddress: Address
  bytecode?: string
  issueTokenAmount?: string
  alphAmount?: string
}

export type PartialTxData<T, K extends keyof T> = {
  [P in keyof Omit<T, K>]?: T[P]
} & Pick<T, K>

export type CheckTxProps<T> = {
  data: T
  fees: bigint
  onSubmit: () => void
}

export type UnsignedTx = {
  fromGroup: number
  toGroup: number
  unsignedTx: string
  gasAmount: number
  gasPrice: string
}

export type TxContext = {
  setIsSweeping: (isSweeping: boolean) => void
  sweepUnsignedTxs: node.SweepAddressTransaction[]
  setSweepUnsignedTxs: (txs: node.SweepAddressTransaction[]) => void
  setFees: (fees: bigint | undefined) => void
  unsignedTransaction: UnsignedTx | undefined
  setUnsignedTransaction: (tx: UnsignedTx | undefined) => void
  unsignedTxId: string
  setUnsignedTxId: (txId: string) => void
  isSweeping: boolean
  consolidationRequired: boolean
}

export type AddressConfirmedTransaction = explorer.Transaction & { address: Address }
export type AddressPendingTransaction = PendingTransaction & { address: Address }
export type AddressTransaction = AddressConfirmedTransaction | AddressPendingTransaction

export type TransactionTimePeriod = '24h' | '1w' | '1m' | '6m' | '12m' | 'previousYear' | 'thisYear'

export type Direction = Omit<TransactionInfoType, 'pending'>

export type TransactionInfo = {
  assets: TransactionInfoAsset[]
  direction: TransactionDirection
  infoType: TransactionInfoType
  outputs: explorer.Output[]
  lockTime?: Date
}

export type CsvExportTimerangeQueryParams = {
  fromTs: number
  toTs: number
}

export type CsvExportQueryParams = CsvExportTimerangeQueryParams & {
  addressHash: AddressHash
}
