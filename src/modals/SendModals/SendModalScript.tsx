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
import { SignExecuteScriptTxResult } from '@alephium/web3'
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
import { selectAllAddresses, transactionSent } from '@/storage/app-state/slices/addressesSlice'
import { store } from '@/storage/app-state/store'
import { CheckTxProps, PartialTxData, ScriptTxData, TxContext, TxPreparation } from '@/types/transactions'
import { getAvailableBalance } from '@/utils/addresses'
import { expectedAmount, isAmountWithinRange } from '@/utils/transactions'

interface ScriptTxModalModalProps {
  onClose: () => void
}

interface ScriptBuildTxModalContentProps {
  data: PartialTxData<ScriptTxData, 'fromAddress'>
  onSubmit: (data: ScriptTxData) => void
  onCancel: () => void
}

const ScriptTxModal = ({ onClose }: ScriptTxModalModalProps) => {
  const { t } = useTranslation()
  const initialTxData = useDappTxData() as ScriptBuildTxModalContentProps['data']

  return (
    <SendModal
      title={t`Call contract`}
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

const ScriptCheckTxModalContent = ({ data, fees }: CheckTxProps<ScriptTxData>) => {
  const { t } = useTranslation()

  return (
    <>
      <CheckAddressesBox fromAddress={data.fromAddress.hash} />
      <InfoBox label={t`Bytecode`} text={data.bytecode} wordBreak />
      <AlphAmountInfoBox label={t`Amount`} amount={expectedAmount(data, fees)} />
      <CheckFeeLockTimeBox fee={fees} />
    </>
  )
}

const ScriptBuildTxModalContent = ({ data, onSubmit, onCancel }: ScriptBuildTxModalContentProps) => {
  const { t } = useTranslation()
  const addresses = useAppSelector(selectAllAddresses)
  const [txPrep, , setTxPrepProp] = useStateObject<TxPreparation>({
    fromAddress: data.fromAddress ?? '',
    bytecode: data.bytecode ?? '',
    alphAmount: data.alphAmount ?? ''
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

  const { fromAddress, bytecode, alphAmount } = txPrep
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
        <AmountInput value={alphAmount} onChange={setTxPrepProp('alphAmount')} availableAmount={availableBalance} />
        <Input
          id="code"
          label={t`Bytecode`}
          value={bytecode}
          onChange={(e) => setTxPrepProp('bytecode')(e.target.value)}
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
            alphAmount: alphAmount || undefined,
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

const buildTransaction = async (txData: ScriptTxData, ctx: TxContext) => {
  if (!txData.alphAmount) {
    txData.alphAmount = undefined
  }
  const attoAlphAmount =
    txData.alphAmount !== undefined ? fromHumanReadableAmount(txData.alphAmount).toString() : undefined
  const response = await client.web3.contracts.postContractsUnsignedTxExecuteScript({
    fromPublicKey: txData.fromAddress.publicKey,
    bytecode: txData.bytecode,
    attoAlphAmount,
    gasAmount: txData.gasAmount,
    gasPrice: txData.gasPrice ? fromHumanReadableAmount(txData.gasPrice).toString() : undefined
  })
  ctx.setUnsignedTransaction(response)
  ctx.setUnsignedTxId(response.txId)
  ctx.setFees(BigInt(response.gasAmount) * BigInt(response.gasPrice))
}

const handleSend = async ({ fromAddress, alphAmount }: ScriptTxData, ctx: TxContext) => {
  if (!ctx.unsignedTransaction) throw Error('No unsignedTransaction available')

  const data = await signAndSendTransaction(fromAddress, ctx.unsignedTxId, ctx.unsignedTransaction.unsignedTx)

  store.dispatch(
    transactionSent({
      hash: data.txId,
      fromAddress: fromAddress.hash,
      toAddress: '',
      amount: alphAmount ? fromHumanReadableAmount(alphAmount).toString() : undefined,
      timestamp: new Date().getTime(),
      type: 'contract',
      status: 'pending'
    })
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
