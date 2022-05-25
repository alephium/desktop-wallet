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
import { SignExecuteScriptTxResult } from '@alephium/web3'
import { useTranslation } from 'react-i18next'

import InfoBox from '../../components/InfoBox'
import AmountInput from '../../components/Inputs/AmountInput'
import Input from '../../components/Inputs/Input'
import { useAddressesContext } from '../../contexts/addresses'
import { Client } from '../../contexts/global'
import { useSendModalContext } from '../../contexts/sendModal'
import useDappTxData from '../../hooks/useDappTxData'
import useStateObject from '../../hooks/useStateObject'
import { CheckTxProps, PartialTxData, ScriptTxData, TxContext, TxPreparation } from '../../types/transactions'
import { expectedAmount, hasNoGasErrors, isAmountWithinRange } from '../../utils/transactions'
import AddressSelectFrom from './AddressSelectFrom'
import AlphAmountInfoBox from './AlphAmountInfoBox'
import BuildTxFooterButtons from './BuildTxFooterButtons'
import GasSettingsExpandableSection from './GasSettingsExpandableSection'
import { ModalInputFields } from './ModalInputFields'
import SendModal from './SendModal'

interface ScriptBuildTxModalContentProps {
  data: PartialTxData<ScriptTxData, 'fromAddress'>
  onSubmit: (data: ScriptTxData) => void
  onCancel: () => void
}

const ScriptTxModal = () => {
  const { t } = useTranslation('App')
  const { closeSendModal } = useSendModalContext()
  const initialTxData = useDappTxData() as ScriptBuildTxModalContentProps['data']

  return (
    <SendModal
      title={t`Call contract`}
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

const ScriptCheckTxModalContent = ({ data, fees }: CheckTxProps<ScriptTxData>) => {
  const { t } = useTranslation('App')

  return (
    <>
      <InfoBox label={t`From address`} text={data.fromAddress.hash} wordBreak />
      <InfoBox label={t`Bytecode`} text={data.bytecode} wordBreak />
      <AlphAmountInfoBox label={t`Amount`} amount={expectedAmount(data, fees)} />
      <AlphAmountInfoBox label={t`Expected fee`} amount={fees} fullPrecision />
    </>
  )
}

const ScriptBuildTxModalContent = ({ data, onSubmit, onCancel }: ScriptBuildTxModalContentProps) => {
  const { t } = useTranslation('App')
  const { addresses } = useAddressesContext()
  const [txPrep, , setTxPrepProp] = useStateObject<TxPreparation>({
    fromAddress: data.fromAddress ?? '',
    bytecode: data.bytecode ?? '',
    gasAmount: {
      parsed: data.gasAmount,
      raw: data.gasAmount?.toString() ?? '',
      error: ''
    },
    gasPrice: {
      parsed: data.gasPrice,
      raw: data.gasPrice ?? '',
      error: ''
    },
    alphAmount: data.alphAmount ?? ''
  })
  const { fromAddress, bytecode, gasAmount, gasPrice, alphAmount } = txPrep

  if (fromAddress === undefined) {
    onCancel()
    return null
  }

  const isSubmitButtonActive =
    hasNoGasErrors({ gasAmount, gasPrice }) &&
    !!bytecode &&
    (!alphAmount || isAmountWithinRange(convertAlphToSet(alphAmount), fromAddress.availableBalance))

  return (
    <>
      <ModalInputFields>
        <AddressSelectFrom defaultAddress={fromAddress} addresses={addresses} onChange={setTxPrepProp('fromAddress')} />
        <AmountInput
          value={alphAmount}
          onChange={setTxPrepProp('alphAmount')}
          availableAmount={fromAddress.availableBalance}
        />
        <Input
          id="code"
          label={t`Bytecode`}
          value={bytecode}
          onChange={(e) => setTxPrepProp('bytecode')(e.target.value)}
        />
      </ModalInputFields>
      <GasSettingsExpandableSection
        gasAmount={gasAmount}
        gasPrice={gasPrice}
        onGasAmountChange={setTxPrepProp('gasAmount')}
        onGasPriceChange={setTxPrepProp('gasPrice')}
      />
      <BuildTxFooterButtons
        onSubmit={() =>
          onSubmit({
            fromAddress,
            bytecode: bytecode ?? '',
            alphAmount: alphAmount || undefined,
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
  if (!txData.alphAmount) {
    txData.alphAmount = undefined
  }
  const attoAlphAmount = txData.alphAmount !== undefined ? convertAlphToSet(txData.alphAmount).toString() : undefined
  const response = await client.web3.contracts.postContractsUnsignedTxExecuteScript({
    fromPublicKey: txData.fromAddress.publicKey,
    bytecode: txData.bytecode,
    attoAlphAmount,
    tokens: undefined,
    gasAmount: txData.gasAmount,
    gasPrice: txData.gasPrice ? convertAlphToSet(txData.gasPrice).toString() : undefined
  })
  ctx.setUnsignedTransaction(response)
  ctx.setUnsignedTxId(response.txId)
  ctx.setFees(BigInt(response.gasAmount) * BigInt(response.gasPrice))
}

const handleSend = async (client: Client, txData: ScriptTxData, ctx: TxContext) => {
  if (!ctx.unsignedTransaction) throw Error('No unsignedTransaction available')

  const data = await client.signAndSendContractOrScript(
    txData.fromAddress,
    ctx.unsignedTxId,
    ctx.unsignedTransaction.unsignedTx,
    ctx.currentNetwork
  )

  return data.signature
}

const getWalletConnectResult = (context: TxContext, signature: string): SignExecuteScriptTxResult => {
  if (!context.unsignedTransaction) throw Error('No unsignedTransaction available')

  return {
    fromGroup: context.unsignedTransaction.fromGroup,
    toGroup: context.unsignedTransaction.toGroup,
    unsignedTx: context.unsignedTransaction.unsignedTx,
    txId: context.unsignedTxId,
    signature,
    gasAmount: context.unsignedTransaction.gasAmount,
    gasPrice: BigInt(context.unsignedTransaction.gasPrice)
  }
}

export default ScriptTxModal
