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

import { convertAlphToSet } from '@alephium/sdk'
import { SignExecuteScriptTxResult } from 'alephium-web3'

import { Client } from '../../../contexts/global'
import { ScriptTxData } from '../../../types/transactions'
import SendModal, { TxContext } from '../SendModal'
import { ScriptBuildTxModalContentProps } from './BuildTxModalContent'
import ScriptBuildTxModalContent from './BuildTxModalContent'
import ScriptCheckTxModalContent from './CheckTxModalContent'

export type ScriptTxModalProps = {
  initialTxData: ScriptBuildTxModalContentProps['data']
  onClose: () => void
}

const ScriptTxModal = ({ initialTxData, onClose }: ScriptTxModalProps) => {
  const buildTransaction = async (client: Client, txData: ScriptTxData, ctx: TxContext) => {
    const response = await client.web3.contracts.postContractsUnsignedTxExecuteScript({
      fromPublicKey: txData.fromAddress.publicKey,
      bytecode: txData.bytecode,
      alphAmount: txData.alphAmount,
      tokens: undefined,
      gasAmount: txData.gasAmount,
      gasPrice: txData.gasPrice ? convertAlphToSet(txData.gasPrice).toString() : undefined
    })
    ctx.setUnsignedTransaction(response)
    ctx.setUnsignedTxId(response.txId)
    ctx.setFees(BigInt(response.gasAmount) * BigInt(response.gasPrice))
  }

  const handleSend = async (client: Client, txData: ScriptTxData, ctx: TxContext) => {
    if (ctx.unsignedTransaction) {
      const data = await client.signAndSendContractOrScript(
        txData.fromAddress,
        ctx.unsignedTxId,
        ctx.unsignedTransaction.unsignedTx,
        ctx.currentNetwork
      )

      return data.signature
    }

    throw Error('No unsignedTransaction available')
  }

  const getWalletConnectResult = (context: TxContext, signature: string): SignExecuteScriptTxResult => {
    if (context.unsignedTransaction)
      return {
        fromGroup: context.unsignedTransaction.fromGroup,
        toGroup: context.unsignedTransaction.toGroup,
        unsignedTx: context.unsignedTransaction.unsignedTx,
        txId: context.unsignedTxId,
        signature
      }

    throw Error('No unsignedTransaction available')
  }

  return (
    <SendModal
      buildTitle="Call Contract"
      initialTxData={initialTxData}
      onClose={onClose}
      BuildTxModalContent={ScriptBuildTxModalContent}
      CheckTxModalContent={ScriptCheckTxModalContent}
      buildTransaction={buildTransaction}
      handleSend={handleSend}
      getWalletConnectResult={getWalletConnectResult}
    />
  )
}

export default ScriptTxModal
