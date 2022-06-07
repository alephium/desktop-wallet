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

import InfoBox from '../../components/InfoBox'
import { Client } from '../../contexts/global'
import { useSendModalContext } from '../../contexts/sendModal'
import useDappTxData from '../../hooks/useDappTxData'
import { ScriptTxData } from '../../types/transactions'
import { isAmountWithinRange } from '../../utils/transactions'
import AlphAmountInfoBox from './AlphAmountInfoBox'
import BuildTxFooterButtons from './BuildTxFooterButtons'
import { useBuildTxCommonComponents, useBytecodeInputComponent } from './hooks'
import { ModalInputFields } from './ModalInputFields'
import SendModal, { TxContext } from './SendModal'
import { CheckTxProps, PartialTxData } from './types'
import { expectedAmount } from './utils'

interface ScriptBuildTxModalContentProps {
  data: PartialTxData<ScriptTxData, 'fromAddress'>
  onSubmit: (data: ScriptTxData) => void
  onCancel: () => void
}

const ScriptTxModal = () => {
  const { closeSendModal } = useSendModalContext()
  const initialTxData = useDappTxData() as ScriptBuildTxModalContentProps['data']

  return (
    <SendModal
      title="Call Contract"
      initialTxData={initialTxData}
      onClose={closeSendModal}
      BuildTxModalContent={ScriptBuildTxModalContent}
      CheckTxModalContent={ScriptCheckTxModalContent}
      buildTransaction={buildTransaction}
      handleSend={handleSend}
      getWalletConnectResult={getWalletConnectResult}
    />
  )
}

const ScriptCheckTxModalContent = ({ data, fees }: CheckTxProps<ScriptTxData>) => (
  <>
    <InfoBox label="From address" text={data.fromAddress.hash} wordBreak />
    <InfoBox label="Bytecode" text={data.bytecode} wordBreak />
    <AlphAmountInfoBox label="Amount" amount={expectedAmount(data, fees)} />
    <AlphAmountInfoBox label="Expected fee" amount={fees} fullPrecision />
  </>
)

const ScriptBuildTxModalContent = ({ data, onSubmit, onCancel }: ScriptBuildTxModalContentProps) => {
  const [
    fromAddress,
    FromAddressSelect,
    alphAmount,
    AlphAmountInput,
    gasAmount,
    gasPrice,
    GasSettingsExpandableSection,
    isCommonReady
  ] = useBuildTxCommonComponents(data.fromAddress, data.alphAmount, data.gasAmount, data.gasPrice)
  const [bytecode, BytecodeInput] = useBytecodeInputComponent(data.bytecode ?? '')

  if (fromAddress === undefined) {
    onCancel()
    return <></>
  }

  const isSubmitButtonActive =
    isCommonReady &&
    bytecode &&
    (!alphAmount || isAmountWithinRange(convertAlphToSet(alphAmount), fromAddress.availableBalance))

  return (
    <>
      <ModalInputFields>
        {FromAddressSelect}
        {AlphAmountInput}
        {BytecodeInput}
      </ModalInputFields>
      {GasSettingsExpandableSection}
      <BuildTxFooterButtons
        onSubmit={() =>
          onSubmit({
            fromAddress: data.fromAddress,
            bytecode: bytecode,
            alphAmount: alphAmount ? alphAmount : undefined,
            gasAmount: gasAmount.parsed,
            gasPrice: gasPrice.parsed
          })
        }
        onCancel={onCancel}
        isSubmitButtonActive={isSubmitButtonActive}
      />
    </>
  )
}

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

export default ScriptTxModal
