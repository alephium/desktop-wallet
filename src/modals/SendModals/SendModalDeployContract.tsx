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

import { fromHumanReadableAmount } from '@alephium/sdk'
import { binToHex, contractIdFromAddress, SignDeployContractTxResult } from '@alephium/web3'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import client from '@/api/client'
import { signAndSendTransaction } from '@/api/transactions'
import InfoBox from '@/components/InfoBox'
import { InputFieldsColumn } from '@/components/InputFieldsColumn'
import AmountInput from '@/components/Inputs/AmountInput'
import Input from '@/components/Inputs/Input'
import ToggleSection from '@/components/ToggleSection'
import { useAppSelector } from '@/hooks/redux'
import useDappTxData from '@/hooks/useDappTxData'
import useGasSettings from '@/hooks/useGasSettings'
import useStateObject from '@/hooks/useStateObject'
import AddressSelectFrom from '@/modals/SendModals/AddressSelectFrom'
import AlphAmountInfoBox from '@/modals/SendModals/AlphAmountInfoBox'
import CheckAddressesBox from '@/modals/SendModals/CheckAddressesBox'
import CheckFeeLockTimeBox from '@/modals/SendModals/CheckFeeLockTimeBox'
import FooterButton from '@/modals/SendModals/FooterButton'
import GasSettings from '@/modals/SendModals/GasSettings'
import SendModal from '@/modals/SendModals/SendModal'
import { selectAllAddresses, transactionSent } from '@/storage/addresses/addressesSlice'
import { store } from '@/storage/store'
import { CheckTxProps, DeployContractTxData, PartialTxData, TxContext, TxPreparation } from '@/types/transactions'
import { getAvailableBalance } from '@/utils/addresses'
import { expectedAmount, isAmountWithinRange } from '@/utils/transactions'

interface DeployContractTxModalProps {
  onClose: () => void
}

interface DeployContractBuildTxModalContentProps {
  data: PartialTxData<DeployContractTxData, 'fromAddress'>
  onSubmit: (data: DeployContractTxData) => void
  onCancel: () => void
}

const DeployContractTxModal = ({ onClose }: DeployContractTxModalProps) => {
  const { t } = useTranslation()
  const initialTxData = useDappTxData() as DeployContractBuildTxModalContentProps['data']
  const [contractAddress, setContractAddress] = useState('')

  const buildTransaction = async (data: DeployContractTxData, context: TxContext) => {
    const initialAttoAlphAmount =
      data.initialAlphAmount !== undefined ? fromHumanReadableAmount(data.initialAlphAmount).toString() : undefined
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
      onClose={onClose}
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
      <CheckAddressesBox fromAddress={data.fromAddress} />
      <InfoBox label={t`Bytecode`} text={data.bytecode} wordBreak />
      <AlphAmountInfoBox label={t`Amount`} amount={expectedAmount(data, fees)} />
      {data.issueTokenAmount && <InfoBox text={data.issueTokenAmount} label={t`Issue token amount`} wordBreak />}
      <CheckFeeLockTimeBox fee={fees} />
    </>
  )
}

const DeployContractBuildTxModalContent = ({ data, onSubmit, onCancel }: DeployContractBuildTxModalContentProps) => {
  const { t } = useTranslation()
  const addresses = useAppSelector(selectAllAddresses)
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
  const availableBalance = getAvailableBalance(fromAddress)

  if (fromAddress === undefined) {
    onCancel()
    return null
  }

  const isSubmitButtonActive =
    !gasPriceError &&
    !gasAmountError &&
    !!bytecode &&
    (!alphAmount || isAmountWithinRange(fromHumanReadableAmount(alphAmount), availableBalance))

  return (
    <>
      <InputFieldsColumn>
        <AddressSelectFrom defaultAddress={fromAddress} addresses={addresses} onChange={setTxPrepProp('fromAddress')} />
        <Input
          id="code"
          label={t`Bytecode`}
          value={bytecode}
          onChange={(e) => setTxPrepProp('bytecode')(e.target.value)}
        />
        <AmountInput value={alphAmount} onChange={setTxPrepProp('alphAmount')} availableAmount={availableBalance} />
        <Input
          id="issue-token-amount"
          label={t`Tokens to issue (optional)`}
          value={issueTokenAmount}
          type="number"
          onChange={(e) => setTxPrepProp('issueTokenAmount')(e.target.value)}
        />
      </InputFieldsColumn>
      <ToggleSection title={t('Show advanced options')} subtitle={t('Set gas settings')} onClick={clearGasSettings}>
        <GasSettings
          gasAmount={gasAmount}
          gasAmountError={gasAmountError}
          gasPrice={gasPrice}
          gasPriceError={gasPriceError}
          onGasAmountChange={handleGasAmountChange}
          onGasPriceChange={handleGasPriceChange}
        />
      </ToggleSection>
      <FooterButton
        onClick={() =>
          onSubmit({
            fromAddress,
            bytecode: bytecode ?? '',
            issueTokenAmount: issueTokenAmount || undefined,
            initialAlphAmount: (alphAmount && fromHumanReadableAmount(alphAmount).toString()) || undefined,
            gasAmount: gasAmount ? parseInt(gasAmount) : undefined,
            gasPrice
          })
        }
        disabled={!isSubmitButtonActive}
      >
        {t('Check')}
      </FooterButton>
    </>
  )
}

const handleSend = async ({ fromAddress }: DeployContractTxData, context: TxContext) => {
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

  return data.signature
}

export default DeployContractTxModal
