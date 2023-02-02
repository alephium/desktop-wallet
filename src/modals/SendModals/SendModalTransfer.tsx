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
import { SignTransferTxResult } from '@alephium/web3'
import dayjs from 'dayjs'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import InfoBox from '../../components/InfoBox'
import AmountInput from '../../components/Inputs/AmountInput'
import Input from '../../components/Inputs/Input'
import ToggleSection from '../../components/ToggleSection'
import { useAddressesContext } from '../../contexts/addresses'
import { Client } from '../../contexts/global'
import { useSendModalContext } from '../../contexts/sendModal'
import useDappTxData from '../../hooks/useDappTxData'
import useGasSettings from '../../hooks/useGasSettings'
import useStateObject from '../../hooks/useStateObject'
import { CheckTxProps, PartialTxData, TransferTxData, TxContext, TxPreparation } from '../../types/transactions'
import { isAddressValid } from '../../utils/addresses'
import { formatDateForDisplay } from '../../utils/misc'
import { expectedAmount, isAmountWithinRange } from '../../utils/transactions'
import AddressSelectFrom from './AddressSelectFrom'
import AlphAmountInfoBox from './AlphAmountInfoBox'
import BuildTxFooterButtons from './BuildTxFooterButtons'
import GasSettingsExpandableSection from './GasSettingsExpandableSection'
import { ModalInputFields } from './ModalInputFields'
import SendModal from './SendModal'

interface TransferBuildTxModalContentProps {
  data: PartialTxData<TransferTxData, 'fromAddress'>
  onSubmit: (data: TransferTxData) => void
  onCancel: () => void
}

const TransferTxModal = () => {
  const { t } = useTranslation()
  const { closeSendModal } = useSendModalContext()
  const initialTxData = useDappTxData() as TransferBuildTxModalContentProps['data']

  return (
    <SendModal
      title={t`Send`}
      initialTxData={initialTxData}
      onClose={closeSendModal}
      BuildTxModalContent={TransferBuildTxModalContent}
      CheckTxModalContent={TransferCheckTxModalContent}
      buildTransaction={buildTransaction}
      handleSend={handleSend}
      getWalletConnectResult={getWalletConnectResult}
    />
  )
}

const TransferCheckTxModalContent = ({ data, fees }: CheckTxProps<TransferTxData>) => {
  const { t } = useTranslation()

  return (
    <>
      <InfoBox label={t`From address`} text={data.fromAddress.hash} wordBreak />
      <InfoBox label={t`To address`} text={data.toAddress} wordBreak />
      <AlphAmountInfoBox label={t`Amount`} amount={expectedAmount(data, fees)} />
      {data.lockTime && <InfoBox label={t`Unlocks at`}>{formatDateForDisplay(data.lockTime)}</InfoBox>}
      <AlphAmountInfoBox label={t`Expected fee`} amount={fees} fullPrecision />
    </>
  )
}

const TransferBuildTxModalContent = ({ data, onSubmit, onCancel }: TransferBuildTxModalContentProps) => {
  const { t } = useTranslation()
  const { addresses } = useAddressesContext()
  const [lockTime, setLockTime] = useState(data.lockTime)
  const [txPrep, , setTxPrepProp] = useStateObject<TxPreparation>({
    fromAddress: data.fromAddress ?? '',
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

  const [toAddress, setToAddress] = useStateWithError(data?.toAddress ?? '')

  const handleToAddressChange = (value: string) => {
    setToAddress(value, isAddressValid(value) ? '' : t`Address format is incorrect`)
  }

  const handleLocktimeChange = (lockTimeInput: string) => {
    setLockTime(lockTimeInput ? dayjs(lockTimeInput).toDate() : undefined)
  }

  const onClickClearLockTime = (isShown: boolean) => {
    setLockTime(isShown ? undefined : dayjs().toDate())
  }

  const { fromAddress, alphAmount } = txPrep

  if (fromAddress === undefined) {
    onCancel()
    return null
  }

  const isSubmitButtonActive =
    !gasPriceError &&
    !gasAmountError &&
    toAddress.value &&
    !toAddress.error &&
    !!alphAmount &&
    isAmountWithinRange(convertAlphToSet(alphAmount), fromAddress.availableBalance)

  return (
    <>
      <ModalInputFields>
        <AddressSelectFrom defaultAddress={fromAddress} addresses={addresses} onChange={setTxPrepProp('fromAddress')} />
        <Input
          label={t`Recipient's address`}
          value={toAddress.value}
          onChange={(e) => handleToAddressChange(e.target.value)}
          error={toAddress.error}
          isValid={toAddress.value.length > 0 && !toAddress.error}
        />
        <AmountInput
          value={alphAmount}
          onChange={setTxPrepProp('alphAmount')}
          availableAmount={fromAddress.availableBalance}
        />
      </ModalInputFields>
      <ToggleSections>
        <ToggleSection title={t`Set lock time`} onClick={onClickClearLockTime} isOpen={!!lockTime}>
          <Input
            id="locktime"
            label={t`Lock time`}
            value={lockTime ? dayjs(lockTime).format('YYYY-MM-DDTHH:mm') : ''}
            onChange={(e) => handleLocktimeChange(e.target.value)}
            type="datetime-local"
            hint="DD/MM/YYYY hh:mm"
            min={dayjs().format('YYYY-MM-DDTHH:mm')}
            liftLabel
          />
        </ToggleSection>
        <GasSettingsExpandableSection
          gasAmount={gasAmount}
          gasAmountError={gasAmountError}
          gasPrice={gasPrice}
          gasPriceError={gasPriceError}
          onGasAmountChange={handleGasAmountChange}
          onGasPriceChange={handleGasPriceChange}
          onClearGasSettings={clearGasSettings}
          isOpen={!!gasAmount || !!gasPrice}
        />
      </ToggleSections>
      <BuildTxFooterButtons
        onSubmit={() =>
          onSubmit({
            fromAddress: fromAddress,
            toAddress: toAddress.value,
            alphAmount: alphAmount || '',
            gasAmount: gasAmount ? parseInt(gasAmount) : undefined,
            gasPrice,
            lockTime
          })
        }
        onCancel={onCancel}
        isSubmitButtonActive={isSubmitButtonActive}
      />
    </>
  )
}

const buildTransaction = async (client: Client, transactionData: TransferTxData, context: TxContext) => {
  const { fromAddress, toAddress, alphAmount, gasAmount, gasPrice, lockTime } = transactionData
  const amountInSet = convertAlphToSet(alphAmount)
  const sweep = amountInSet === fromAddress.availableBalance

  context.setIsSweeping(sweep)

  if (sweep) {
    const { unsignedTxs, fees } = await client.buildSweepTransactions(fromAddress, toAddress)
    context.setSweepUnsignedTxs(unsignedTxs)
    context.setFees(fees)
  } else {
    const { data } = await client.clique.transactionCreate(
      fromAddress.hash,
      fromAddress.publicKey,
      toAddress,
      amountInSet.toString(),
      lockTime ? lockTime.getTime() : undefined,
      gasAmount ? gasAmount : undefined,
      gasPrice ? convertAlphToSet(gasPrice).toString() : undefined
    )
    context.setUnsignedTransaction(data)
    context.setUnsignedTxId(data.txId)
    context.setFees(BigInt(data.gasAmount) * BigInt(data.gasPrice))
  }
}

const handleSend = async (client: Client, transactionData: TransferTxData, context: TxContext) => {
  const { fromAddress, toAddress, alphAmount, lockTime } = transactionData

  if (toAddress) {
    if (context.isSweeping && context.sweepUnsignedTxs) {
      const sendToAddress = context.consolidationRequired ? fromAddress.hash : toAddress
      const transactionType = context.consolidationRequired ? 'consolidation' : 'sweep'

      for (const { txId, unsignedTx } of context.sweepUnsignedTxs) {
        const data = await client.signAndSendTransaction(
          fromAddress,
          txId,
          unsignedTx,
          sendToAddress,
          transactionType,
          context.currentNetwork
        )

        if (data) context.setAddress(fromAddress)
      }
    } else if (context.unsignedTransaction) {
      const data = await client.signAndSendTransaction(
        fromAddress,
        context.unsignedTxId,
        context.unsignedTransaction.unsignedTx,
        toAddress,
        'transfer',
        context.currentNetwork,
        convertAlphToSet(alphAmount),
        lockTime
      )

      return data.signature
    }
  }
}

const getWalletConnectResult = (context: TxContext, signature: string): SignTransferTxResult => {
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

function useStateWithError<T>(initialValue: T) {
  const [value, setValue] = useState({ value: initialValue, error: '' })

  const setValueWithError = (newValue: T, newError: string) => {
    setValue({ value: newValue, error: newError })
  }

  return [value, setValueWithError] as const
}

const ToggleSections = styled.div`
  > * {
    margin-top: 20px;
  }
`

export default TransferTxModal
