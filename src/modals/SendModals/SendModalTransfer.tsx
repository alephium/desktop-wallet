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

import { convertAlphToSet, isAddressValid } from '@alephium/sdk'
import { SignTransferTxResult } from '@alephium/web3'
import dayjs from 'dayjs'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import client from '@/api/client'
import { buildSweepTransactions, signAndSendTransaction } from '@/api/transactions'
import InfoBox from '@/components/InfoBox'
import { InputFieldsColumn } from '@/components/InputFieldsColumn'
import Input from '@/components/Inputs/Input'
import HorizontalDivider from '@/components/PageComponents/HorizontalDivider'
import ToggleSection from '@/components/ToggleSection'
import { useAppSelector } from '@/hooks/redux'
import useDappTxData from '@/hooks/useDappTxData'
import useGasSettings from '@/hooks/useGasSettings'
import useStateObject from '@/hooks/useStateObject'
import AddressSelectFrom from '@/modals/SendModals/AddressSelectFrom'
import AddressSelectTo from '@/modals/SendModals/AddressSelectTo'
import AlphAmountInfoBox from '@/modals/SendModals/AlphAmountInfoBox'
import AssetAmountsInput from '@/modals/SendModals/AssetAmountsInput'
import BuildTxFooterButtons from '@/modals/SendModals/BuildTxFooterButtons'
import GasSettingsExpandableSection from '@/modals/SendModals/GasSettingsExpandableSection'
import SendModal from '@/modals/SendModals/SendModal'
import { selectAllAddresses, transactionSent } from '@/storage/app-state/slices/addressesSlice'
import { store } from '@/storage/app-state/store'
import { AssetAmount } from '@/types/tokens'
import { CheckTxProps, PartialTxData, TransferTxData, TxContext, TxPreparation } from '@/types/transactions'
import { getAvailableBalance } from '@/utils/addresses'
import { ALPH } from '@/utils/constants'
import { requiredErrorMessage } from '@/utils/form-validation'
import { formatDateForDisplay } from '@/utils/misc'
import { expectedAmount, isAmountWithinRange } from '@/utils/transactions'

interface TransferTxModalProps {
  onClose: () => void
  initialTxData?: Partial<TransferTxData>
}

interface TransferBuildTxModalContentProps {
  data: PartialTxData<TransferTxData, 'fromAddress'>
  onSubmit: (data: TransferTxData) => void
  onCancel: () => void
}

const TransferTxModal = ({ onClose, initialTxData }: TransferTxModalProps) => {
  const { t } = useTranslation()
  const dappInitialTxData = useDappTxData() as TransferBuildTxModalContentProps['data']

  const initData = {
    ...(initialTxData ?? dappInitialTxData),
    fromAddress: initialTxData?.fromAddress ?? dappInitialTxData.fromAddress
  }

  return (
    <SendModal
      title={t`Send`}
      initialTxData={initData}
      onClose={onClose}
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
      {data.lockTime && (
        <InfoBox label={t('Unlocks at')}>
          <UnlocksAt>
            {formatDateForDisplay(data.lockTime)}
            <FromNow>({dayjs(data.lockTime).fromNow()})</FromNow>
          </UnlocksAt>
        </InfoBox>
      )}
      <AlphAmountInfoBox label={t`Expected fee`} amount={fees} fullPrecision />
    </>
  )
}

const TransferBuildTxModalContent = ({ data, onSubmit, onCancel }: TransferBuildTxModalContentProps) => {
  const { t } = useTranslation()
  const addresses = useAppSelector(selectAllAddresses)
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

  const [assetAmounts, setAssetAmounts] = useState<AssetAmount[]>([
    {
      id: ALPH.id
    }
  ])
  const [toAddress, setToAddress] = useStateWithError(data?.toAddress ?? '')

  const handleToAddressChange = (value: string) => {
    setToAddress(value, !value ? requiredErrorMessage : isAddressValid(value) ? '' : t('This address is not valid'))
  }

  const handleLocktimeChange = (lockTimeInput: string) =>
    setLockTime(lockTimeInput ? dayjs(lockTimeInput).toDate() : undefined)

  const onClickClearLockTime = (isShown: boolean) =>
    setLockTime(isShown ? undefined : dayjs().add(1, 'minute').toDate())

  const { fromAddress, alphAmount } = txPrep
  const lockTimeInPast = lockTime && dayjs(lockTime).toDate() < dayjs().toDate()
  const availableBalance = getAvailableBalance(fromAddress)

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
    !lockTimeInPast &&
    isAmountWithinRange(convertAlphToSet(alphAmount), availableBalance)

  return (
    <>
      <InputFieldsColumn>
        <AddressSelectFrom defaultAddress={fromAddress} addresses={addresses} onChange={setTxPrepProp('fromAddress')} />
        <AddressSelectTo
          value={toAddress.value}
          onChange={(e) => handleToAddressChange(e.target.value)}
          onContactSelect={handleToAddressChange}
          error={toAddress.error}
        />
        <AssetAmountsInput
          address={fromAddress}
          assetAmounts={assetAmounts}
          onAssetAmountsChange={setAssetAmounts}
          id="asset-amounts"
        />
      </InputFieldsColumn>
      <HorizontalDividerStyled />
      <ToggleSections>
        <ToggleSection title={t`Set lock time`} onClick={onClickClearLockTime} isOpen={!!lockTime}>
          <Input
            id="locktime"
            label={t('Lock time')}
            value={lockTime ? dayjs(lockTime).format('YYYY-MM-DDTHH:mm') : ''}
            onChange={(e) => handleLocktimeChange(e.target.value)}
            type="datetime-local"
            hint="DD/MM/YYYY hh:mm"
            min={dayjs().format('YYYY-MM-DDTHH:mm')}
            error={lockTimeInPast && t('Lock time must be in the future.')}
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

const buildTransaction = async (transactionData: TransferTxData, context: TxContext) => {
  const { fromAddress, toAddress, alphAmount, gasAmount, gasPrice, lockTime } = transactionData
  const amountInSet = convertAlphToSet(alphAmount)
  const sweep = amountInSet === getAvailableBalance(fromAddress)

  context.setIsSweeping(sweep)

  if (sweep) {
    const { unsignedTxs, fees } = await buildSweepTransactions(fromAddress, toAddress)
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

const handleSend = async (transactionData: TransferTxData, context: TxContext) => {
  const { fromAddress, toAddress, lockTime: lockDateTime, alphAmount } = transactionData
  const { isSweeping, sweepUnsignedTxs, consolidationRequired, unsignedTxId, unsignedTransaction } = context

  if (toAddress) {
    const amount = convertAlphToSet(alphAmount).toString()
    const lockTime = lockDateTime?.getTime()

    if (isSweeping && sweepUnsignedTxs) {
      const sendToAddress = consolidationRequired ? fromAddress.hash : toAddress
      const type = consolidationRequired ? 'consolidation' : 'sweep'

      for (const { txId, unsignedTx } of sweepUnsignedTxs) {
        const data = await signAndSendTransaction(fromAddress, txId, unsignedTx)

        store.dispatch(
          transactionSent({
            hash: data.txId,
            fromAddress: fromAddress.hash,
            toAddress: sendToAddress,
            amount,
            timestamp: new Date().getTime(),
            lockTime,
            type,
            status: 'pending'
          })
        )
      }
    } else if (unsignedTransaction) {
      const data = await signAndSendTransaction(fromAddress, unsignedTxId, unsignedTransaction.unsignedTx)

      store.dispatch(
        transactionSent({
          hash: data.txId,
          fromAddress: fromAddress.hash,
          toAddress,
          amount,
          timestamp: new Date().getTime(),
          lockTime,
          type: 'transfer',
          status: 'pending'
        })
      )

      return data.txId
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

export default TransferTxModal

const ToggleSections = styled.div`
  > * {
    margin-top: 20px;
  }
`

const UnlocksAt = styled.div`
  display: flex;
  gap: var(--spacing-1);
`

const FromNow = styled.div`
  color: ${({ theme }) => theme.font.secondary};
`

const HorizontalDividerStyled = styled(HorizontalDivider)`
  margin: 20px 0;
`
