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
import { binToHex, contractIdFromAddress, convertHttpResponse, SignContractCreationTxResult } from 'alephium-web3'
import { useState } from 'react'

import { Client } from '../../contexts/global'
import BuildDeployContractTx, { BuildDeployContractTxData, BuildDeployContractTxProps } from './BuildDeployContractTx'
import CheckDeployContractTx from './CheckDeployContractTx'
import { TxContext, TxModalFactory } from './TxModal'

export type DeployContractTxModalProps = {
  initialTxData: BuildDeployContractTxProps['data']
  onClose: () => void
}

const DeployContractTxModal = ({ initialTxData, onClose }: DeployContractTxModalProps) => {
  const [contractAddress, setContractAddress] = useState<string>('')

  const buildTransaction = async (client: Client, data: BuildDeployContractTxData, context: TxContext) => {
    const params = {
      fromPublicKey: data.fromAddress.publicKey,
      bytecode: data.bytecode,
      initialFields: data.initialFields,
      alphAmount: data.alphAmount,
      issueTokenAmount: data.issueTokenAmount,
      gas: data.gasAmount,
      gasPrice: data.gasPrice ? convertAlphToSet(data.gasPrice).toString() : undefined
    }
    const response = convertHttpResponse(
      await client.web3.contracts.postContractsUnsignedTxBuildContract({
        fromPublicKey: data.fromAddress.publicKey,
        bytecode: data.bytecode,
        initialFields: data.initialFields,
        alphAmount: data.alphAmount,
        issueTokenAmount: data.issueTokenAmount,
        gasAmount: data.gasAmount,
        gasPrice: data.gasPrice ? convertAlphToSet(data.gasPrice).toString() : undefined
      })
    )
    setContractAddress(response.contractAddress)
    context.setUnsignedTransaction(response.unsignedTx)
    context.setUnsignedTxId(response.txId)
    context.setFees(BigInt(response.gasAmount) * BigInt(response.gasPrice))
  }

  const handleSend = async (client: Client, txData: BuildDeployContractTxData, context: TxContext) => {
    const data = await client.signAndSendContractOrScript(
      txData.fromAddress,
      context.unsignedTxId,
      context.unsignedTransaction,
      context.currentNetwork
    )
    return data.signature
  }

  const getWalletConnectResult = (context: TxContext, signature: string): SignContractCreationTxResult => {
    const contractId = binToHex(contractIdFromAddress(contractAddress))
    return {
      unsignedTx: context.unsignedTransaction,
      txId: context.unsignedTxId,
      signature: signature,
      contractAddress: contractAddress,
      contractId: contractId
    }
  }

  return (
    <TxModalFactory
      buildTitle="Deploy Contract"
      initialTxData={initialTxData}
      onClose={onClose}
      BuildTx={BuildDeployContractTx}
      CheckTx={CheckDeployContractTx}
      buildTransaction={buildTransaction}
      handleSend={handleSend}
      getWalletConnectResult={getWalletConnectResult}
    />
  )
}

export default DeployContractTxModal
