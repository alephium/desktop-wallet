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
import { binToHex, contractIdFromAddress, SignDeployContractTxResult } from 'alephium-web3'
import { useState } from 'react'

import { Client } from '../../../contexts/global'
import { DeployContractTxData } from '../../../types/transactions'
import SendModal, { TxContext } from '../SendModal'
import DeployContractBuildTxModalContent, { DeployContractBuildTxModalContentProps } from './BuildTxModalContent'
import DeployContractCheckTxModalContent from './CheckTxModalContent'

export type DeployContractTxModalProps = {
  initialTxData: DeployContractBuildTxModalContentProps['data']
  onClose: () => void
}

const DeployContractTxModal = ({ initialTxData, onClose }: DeployContractTxModalProps) => {
  const [contractAddress, setContractAddress] = useState<string>('')

  const buildTransaction = async (client: Client, data: DeployContractTxData, context: TxContext) => {
    const response = await client.web3.contracts.postContractsUnsignedTxDeployContract({
      fromPublicKey: data.fromAddress.publicKey,
      bytecode: data.bytecode,
      initialAlphAmount: data.initialAlphAmount,
      issueTokenAmount: data.issueTokenAmount,
      gasAmount: data.gasAmount,
      gasPrice: data.gasPrice ? convertAlphToSet(data.gasPrice).toString() : undefined
    })
    setContractAddress(response.contractAddress)
    context.setUnsignedTransaction(response)
    context.setUnsignedTxId(response.txId)
    context.setFees(BigInt(response.gasAmount) * BigInt(response.gasPrice))
  }

  const handleSend = async (client: Client, txData: DeployContractTxData, context: TxContext) => {
    if (context.unsignedTransaction) {
      const data = await client.signAndSendContractOrScript(
        txData.fromAddress,
        context.unsignedTxId,
        context.unsignedTransaction.unsignedTx,
        context.currentNetwork
      )

      return data.signature
    }

    throw Error('No unsignedTransaction available')
  }

  const getWalletConnectResult = (context: TxContext, signature: string): SignDeployContractTxResult => {
    if (context.unsignedTransaction)
      return {
        fromGroup: context.unsignedTransaction.fromGroup,
        toGroup: context.unsignedTransaction.toGroup,
        unsignedTx: context.unsignedTransaction.unsignedTx,
        txId: context.unsignedTxId,
        signature,
        contractAddress,
        contractId: binToHex(contractIdFromAddress(contractAddress))
      }

    throw Error('No unsignedTransaction available')
  }

  return (
    <SendModal
      buildTitle="Deploy Contract"
      initialTxData={initialTxData}
      onClose={onClose}
      BuildTxModalContent={DeployContractBuildTxModalContent}
      CheckTxModalContent={DeployContractCheckTxModalContent}
      buildTransaction={buildTransaction}
      handleSend={handleSend}
      getWalletConnectResult={getWalletConnectResult}
    />
  )
}

export default DeployContractTxModal
