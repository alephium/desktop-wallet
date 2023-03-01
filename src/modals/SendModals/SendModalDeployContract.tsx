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
import { binToHex, contractIdFromAddress, SignDeployContractTxResult } from '@alephium/web3'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import InfoBox from '../../components/InfoBox'
import AmountInput from '../../components/Inputs/AmountInput'
import Input from '../../components/Inputs/Input'
import { useAddressesContext } from '../../contexts/addresses'
import { Client } from '../../contexts/global'
import { useSendModalContext } from '../../contexts/sendModal'
import useDappTxData from '../../hooks/useDappTxData'
import useGasSettings from '../../hooks/useGasSettings'
import useStateObject from '../../hooks/useStateObject'
import { CheckTxProps, DeployContractTxData, PartialTxData, TxContext, TxPreparation } from '../../types/transactions'
import { expectedAmount, isAmountWithinRange } from '../../utils/transactions'
import AddressSelectFrom from './AddressSelectFrom'
import AlphAmountInfoBox from './AlphAmountInfoBox'
import BuildTxFooterButtons from './BuildTxFooterButtons'
import GasSettingsExpandableSection from './GasSettingsExpandableSection'
import { ModalInputFields } from './ModalInputFields'
import SendModal from './SendModal'

interface DeployContractBuildTxModalContentProps {
  data: PartialTxData<DeployContractTxData, 'fromAddress'>
  onSubmit: (data: DeployContractTxData) => void
  onCancel: () => void
}

const DeployContractTxModal = () => {
  const { t } = useTranslation()
  const { closeSendModal } = useSendModalContext()
  const initialTxData = useDappTxData() as DeployContractBuildTxModalContentProps['data']
  const [contractAddress, setContractAddress] = useState('')

  const buildTransaction = async (client: Client, data: DeployContractTxData, context: TxContext) => {
    const initialAttoAlphAmount =
      data.initialAlphAmount !== undefined ? convertAlphToSet(data.initialAlphAmount).toString() : undefined
    const response = await client.web3.contracts.postContractsUnsignedTxDeployContract({
      fromPublicKey: data.fromAddress.publicKey,
      bytecode: data.bytecode,
      initialAttoAlphAmount: initialAttoAlphAmount,
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
      title={t`Deploy contract`}
      initialTxData={initialTxData}
      onClose={closeSendModal}
      BuildTxModalContent={DeployContractBuildTxModalContent}
      CheckTxModalContent={DeployContractCheckTxModalContent}
      buildTransaction={buildTransaction}
      handleSend={handleSend}
      getWalletConnectResult={getWalletConnectResult}
    />
  )
}

const DeployContractCheckTxModalContent = ({ data, fees }: CheckTxProps<DeployContractTxData>) => {
  const { t } = useTranslation()

  return (
    <>
      <InfoBox label={t`From address`} text={data.fromAddress.hash} wordBreak />
      <InfoBox label={t`Bytecode`} text={data.bytecode} wordBreak />
      <AlphAmountInfoBox label={t`Amount`} amount={expectedAmount(data, fees)} />
      {data.issueTokenAmount && <InfoBox text={data.issueTokenAmount} label={t`Issue token amount`} wordBreak />}
      <AlphAmountInfoBox label={t`Expected fee`} amount={fees} fullPrecision />
    </>
  )
}

const DeployContractBuildTxModalContent = ({ data, onSubmit, onCancel }: DeployContractBuildTxModalContentProps) => {
  const { t } = useTranslation()
  const { addresses } = useAddressesContext()
  const [txPrep, , setTxPrepProp] = useStateObject<TxPreparation>({
    fromAddress: data.fromAddress ?? '',
    bytecode: data.bytecode ?? '',
    alphAmount: data.initialAlphAmount ?? '',
    issueTokenAmount: data.issueTokenAmount ?? ''
  })
  const {
    gasAmount,
    gasAmountError,
    gasPrice,
    gasPriceError,
    clearGasSettings,
    handleGasAmountChange,
    handleGasPriceChange
  } = useGasSettings(data?.gasAmount?.toString(), data?.gasPrice)

  const { fromAddress, bytecode, alphAmount, issueTokenAmount } = txPrep

  if (fromAddress === undefined) {
    onCancel()
    return null
  }

  const isSubmitButtonActive =
    !gasPriceError &&
    !gasAmountError &&
    !!bytecode &&
    (!alphAmount || isAmountWithinRange(convertAlphToSet(alphAmount), fromAddress.availableBalance))

  return (
    <>
      <ModalInputFields>
        <AddressSelectFrom defaultAddress={fromAddress} addresses={addresses} onChange={setTxPrepProp('fromAddress')} />
        <Input
          id="code"
          label={t`Bytecode`}
          value={bytecode}
          onChange={(e) => setTxPrepProp('bytecode')(e.target.value)}
        />
        <AmountInput
          value={alphAmount}
          onChange={setTxPrepProp('alphAmount')}
          availableAmount={fromAddress.availableBalance}
        />
        <Input
          id="issue-token-amount"
          label={t`Tokens to issue (optional)`}
          value={issueTokenAmount}
          type="number"
          onChange={(e) => setTxPrepProp('issueTokenAmount')(e.target.value)}
        />
      </ModalInputFields>
      <GasSettingsExpandableSection
        gasAmount={gasAmount}
        gasAmountError={gasAmountError}
        gasPrice={gasPrice}
        gasPriceError={gasPriceError}
        onGasAmountChange={handleGasAmountChange}
        onGasPriceChange={handleGasPriceChange}
        onClearGasSettings={clearGasSettings}
      />
      <BuildTxFooterButtons
        onSubmit={() =>
          onSubmit({
            fromAddress,
            bytecode: bytecode ?? '',
            issueTokenAmount: issueTokenAmount || undefined,
            initialAlphAmount: (alphAmount && convertAlphToSet(alphAmount).toString()) || undefined,
            gasAmount: gasAmount ? parseInt(gasAmount) : undefined,
            gasPrice
          })
        }
        onCancel={onCancel}
        isSubmitButtonActive={isSubmitButtonActive}
      />
    </>
  )
}

const handleSend = async (client: Client, txData: DeployContractTxData, context: TxContext) => {
  if (!context.unsignedTransaction) throw Error('No unsignedTransaction available')

  const data = await client.signAndSendContractOrScript(
    txData.fromAddress,
    context.unsignedTxId,
    context.unsignedTransaction.unsignedTx,
    context.currentNetwork
  )

  return data.signature
}

export default DeployContractTxModal
