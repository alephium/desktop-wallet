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

import InfoBox from '../../components/InfoBox'
import AmountInput from '../../components/Inputs/AmountInput'
import Input from '../../components/Inputs/Input'
import { useAddressesContext } from '../../contexts/addresses'
import { Client } from '../../contexts/global'
import { useSendModalContext } from '../../contexts/sendModal'
import useDappTxData from '../../hooks/useDappTxData'
import useStateObject from '../../hooks/useStateObject'
import { CheckTxProps, DeployContractTxData, PartialTxData, TxPreparation } from '../../types/transactions'
import { expectedAmount, hasNoGasErrors, isAmountWithinRange } from '../../utils/transactions'
import AddressSelectFrom from './AddressSelectFrom'
import AlphAmountInfoBox from './AlphAmountInfoBox'
import BuildTxFooterButtons from './BuildTxFooterButtons'
import BytecodeInput from './BytecodeInput'
import GasSettingsExpandableSection from './GasSettingsExpandableSection'
import { ModalInputFields } from './ModalInputFields'
import SendModal, { TxContext } from './SendModal'

interface DeployContractBuildTxModalContentProps {
  data: PartialTxData<DeployContractTxData, 'fromAddress'>
  onSubmit: (data: DeployContractTxData) => void
  onCancel: () => void
}

const DeployContractTxModal = () => {
  const { closeSendModal } = useSendModalContext()
  const initialTxData = useDappTxData() as DeployContractBuildTxModalContentProps['data']
  const [contractAddress, setContractAddress] = useState('')

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
      title="Deploy Contract"
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

const DeployContractCheckTxModalContent = ({ data, fees }: CheckTxProps<DeployContractTxData>) => (
  <>
    <InfoBox label="From address" text={data.fromAddress.hash} wordBreak />
    <InfoBox label="Bytecode" text={data.bytecode} wordBreak />
    <AlphAmountInfoBox label="Amount" amount={expectedAmount(data, fees)} />
    {data.issueTokenAmount && <InfoBox text={data.issueTokenAmount} label="Issue token amount" wordBreak />}
    <AlphAmountInfoBox label="Expected fee" amount={fees} fullPrecision />
  </>
)

const DeployContractBuildTxModalContent = ({ data, onSubmit, onCancel }: DeployContractBuildTxModalContentProps) => {
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
    alphAmount: data.initialAlphAmount ?? '',
    issueTokenAmount: data.issueTokenAmount ?? ''
  })

  const { fromAddress, bytecode, gasAmount, gasPrice, alphAmount, issueTokenAmount } = txPrep

  if (fromAddress === undefined) {
    onCancel()
    return <></>
  }

  const isSubmitButtonActive =
    hasNoGasErrors({ gasAmount, gasPrice }) &&
    !!bytecode &&
    (!alphAmount || isAmountWithinRange(convertAlphToSet(alphAmount), fromAddress.availableBalance))

  return (
    <>
      <ModalInputFields>
        <AddressSelectFrom defaultAddress={fromAddress} addresses={addresses} onChange={setTxPrepProp('fromAddress')} />
        <BytecodeInput value={bytecode} onChange={(e) => setTxPrepProp('bytecode')(e.target.value)} />
        <AmountInput
          value={alphAmount}
          onChange={setTxPrepProp('alphAmount')}
          availableAmount={fromAddress.availableBalance}
        />
        <Input
          id="issue-token-amount"
          label="Tokens to issue (optional)"
          value={issueTokenAmount}
          type="number"
          onChange={(e) => setTxPrepProp('issueTokenAmount')(e.target.value)}
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
            issueTokenAmount: issueTokenAmount || undefined,
            initialAlphAmount: alphAmount || undefined,
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

export default DeployContractTxModal
