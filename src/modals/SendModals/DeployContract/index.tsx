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

import { binToHex, contractIdFromAddress, SignDeployContractTxResult } from '@alephium/web3'
import { PostHog } from 'posthog-js'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import client from '@/api/client'
import { signAndSendTransaction } from '@/api/transactions'
import DeployContractAddressesTxModalContent from '@/modals/SendModals/DeployContract/AddressesTxModalContent'
import DeployContractBuildTxModalContent from '@/modals/SendModals/DeployContract/BuildTxModalContent'
import DeployContractCheckTxModalContent from '@/modals/SendModals/DeployContract/CheckTxModalContent'
import SendModal from '@/modals/SendModals/SendModal'
import { store } from '@/storage/store'
import { transactionSent } from '@/storage/transactions/transactionsActions'
import { DeployContractTxData, PartialTxData, TxContext } from '@/types/transactions'

interface DeployContractTxModalProps {
  onClose: () => void
  initialTxData: PartialTxData<DeployContractTxData, 'fromAddress'>
  txData?: DeployContractTxData
}

const SendModalDeployContract = ({ onClose, initialTxData, txData }: DeployContractTxModalProps) => {
  const { t } = useTranslation()

  const [contractAddress, setContractAddress] = useState('')

  const buildTransaction = async (data: DeployContractTxData, context: TxContext) => {
    const initialAttoAlphAmount =
      data.initialAlphAmount !== undefined ? data.initialAlphAmount.amount?.toString() : undefined
    const response = await client.node.contracts.postContractsUnsignedTxDeployContract({
      fromPublicKey: data.fromAddress.publicKey,
      bytecode: data.bytecode,
      initialAttoAlphAmount,
      issueTokenAmount: data.issueTokenAmount?.toString(),
      gasAmount: data.gasAmount,
      gasPrice: data.gasPrice?.toString()
    })
    setContractAddress(response.contractAddress)
    context.setUnsignedTransaction(response)
    context.setUnsignedTxId(response.txId)
    context.setFees(BigInt(response.gasAmount) * BigInt(response.gasPrice))
  }

  const getWalletConnectResult = (context: TxContext, signature: string): SignDeployContractTxResult => {
    if (!context.unsignedTransaction) throw Error('No unsignedTransaction available')

    return {
      groupIndex: context.unsignedTransaction.fromGroup,
      unsignedTx: context.unsignedTransaction.unsignedTx,
      txId: context.unsignedTxId,
      signature,
      contractAddress,
      contractId: binToHex(contractIdFromAddress(contractAddress)),
      gasAmount: context.unsignedTransaction.gasAmount,
      gasPrice: BigInt(context.unsignedTransaction.gasPrice)
    }
  }

  return (
    <SendModal
      title={t('Deploy contract')}
      initialTxData={initialTxData}
      onClose={onClose}
      AddressesTxModalContent={DeployContractAddressesTxModalContent}
      BuildTxModalContent={DeployContractBuildTxModalContent}
      CheckTxModalContent={DeployContractCheckTxModalContent}
      buildTransaction={buildTransaction}
      handleSend={handleSend}
      getWalletConnectResult={getWalletConnectResult}
      txData={txData}
      isContract
    />
  )
}

export default SendModalDeployContract

const handleSend = async ({ fromAddress }: DeployContractTxData, context: TxContext, posthog?: PostHog) => {
  if (!context.unsignedTransaction) throw Error('No unsignedTransaction available')

  const data = await signAndSendTransaction(fromAddress, context.unsignedTxId, context.unsignedTransaction.unsignedTx)

  store.dispatch(
    transactionSent({
      hash: data.txId,
      fromAddress: fromAddress.hash,
      toAddress: '',
      timestamp: new Date().getTime(),
      type: 'contract',
      status: 'pending'
    })
  )

  posthog?.capture('Deployed smart contract')

  return data.signature
}
