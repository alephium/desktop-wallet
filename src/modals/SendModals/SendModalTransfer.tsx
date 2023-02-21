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

import { fromHumanReadableAmount, isAddressValid } from '@alephium/sdk'
import { SignTransferTxResult } from '@alephium/web3'
import dayjs from 'dayjs'
import { Fragment, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import client from '@/api/client'
import { buildSweepTransactions, signAndSendTransaction } from '@/api/transactions'
import Box from '@/components/Box'
import { InputFieldsColumn } from '@/components/InputFieldsColumn'
import Input from '@/components/Inputs/Input'
import HorizontalDivider from '@/components/PageComponents/HorizontalDivider'
import ToggleSection from '@/components/ToggleSection'
import { useAppSelector } from '@/hooks/redux'
import useDappTxData from '@/hooks/useDappTxData'
import useGasSettings from '@/hooks/useGasSettings'
import useStateObject from '@/hooks/useStateObject'
import AddressInputs from '@/modals/SendModals/AddressInputs'
import AssetAmountsInput from '@/modals/SendModals/AssetAmountsInput'
import CheckAddressesBox from '@/modals/SendModals/CheckAddressesBox'
import CheckAmountsBox from '@/modals/SendModals/CheckAmountsBox'
import CheckFeeLocktimeBox from '@/modals/SendModals/CheckFeeLockTimeBox'
import FooterButton from '@/modals/SendModals/FooterButton'
import GasSettings from '@/modals/SendModals/GasSettings'
import SendModal from '@/modals/SendModals/SendModal'
import { selectAllAddresses, transactionSent } from '@/storage/app-state/slices/addressesSlice'
import { store } from '@/storage/app-state/store'
import { AssetAmount } from '@/types/tokens'
import { CheckTxProps, PartialTxData, TransferTxData, TxContext, TxPreparation } from '@/types/transactions'
import { assetAmountsWithinAvailableBalance, getAddressAssetsAvailableBalance } from '@/utils/addresses'
import { ALPH } from '@/utils/constants'
import { requiredErrorMessage } from '@/utils/form-validation'
import { getAssetAmounts } from '@/utils/transactions'

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

const TransferCheckTxModalContent = ({ data, fees }: CheckTxProps<TransferTxData>) => (
  <Content>
    <CheckAmountsBox assetAmounts={data.assetAmounts} />
    <CheckAddressesBox fromAddress={data.fromAddress.hash} toAddress={data.toAddress} />
    <CheckFeeLocktimeBox fee={fees} lockTime={data.lockTime} />
  </Content>
)

const defaultAssetAmounts = [{ id: ALPH.id }]

const TransferBuildTxModalContent = ({ data, onSubmit, onCancel }: TransferBuildTxModalContentProps) => {
  const { t } = useTranslation()
  const addresses = useAppSelector(selectAllAddresses)
  const [lockTime, setLockTime] = useState(data.lockTime)
  const [txPrep, , setTxPrepProp] = useStateObject<TxPreparation>({
    fromAddress: data.fromAddress
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

  const [assetAmounts, setAssetAmounts] = useState<AssetAmount[]>(data.assetAmounts || defaultAssetAmounts)
  const [toAddress, setToAddress] = useStateWithError(data?.toAddress ?? '')

  const { fromAddress } = txPrep

  if (fromAddress === undefined) {
    onCancel()
    return null
  }

  const handleToAddressChange = (value: string) => {
    setToAddress(value, !value ? requiredErrorMessage : isAddressValid(value) ? '' : t('This address is not valid'))
  }

  const handleLocktimeChange = (lockTimeInput: string) =>
    setLockTime(lockTimeInput ? dayjs(lockTimeInput).toDate() : undefined)

  const clearAdvancedSettings = () => {
    clearGasSettings()
    setLockTime(undefined)
  }

  const lockTimeInPast = lockTime && dayjs(lockTime).toDate() < dayjs().toDate()
  const atLeastOneAssetWithAmountIsSet = assetAmounts.some((asset) => asset?.amount && asset.amount > 0)
  const allAssetAmountsAreWithinAvailableBalance = assetAmountsWithinAvailableBalance(fromAddress, assetAmounts)

  const isSubmitButtonActive =
    !gasPriceError &&
    !gasAmountError &&
    toAddress.value &&
    !toAddress.error &&
    !lockTimeInPast &&
    atLeastOneAssetWithAmountIsSet &&
    allAssetAmountsAreWithinAvailableBalance

  return (
    <>
      <InputFieldsColumn>
        <AddressInputs
          defaultFromAddress={fromAddress}
          fromAddresses={addresses}
          onFromAddressChange={setTxPrepProp('fromAddress')}
          toAddress={toAddress}
          onToAddressChange={handleToAddressChange}
          onContactSelect={handleToAddressChange}
        />
        <AssetAmountsInput
          address={fromAddress}
          assetAmounts={assetAmounts}
          onAssetAmountsChange={setAssetAmounts}
          id="asset-amounts"
        />
      </InputFieldsColumn>
      <HorizontalDividerStyled />
      <ToggleSection
        title={t('Show advanced options')}
        subtitle={t('Set gas and lock time')}
        onClick={clearAdvancedSettings}
        isOpen={!!lockTime || !!gasAmount || !!gasPrice}
      >
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
            fromAddress: fromAddress,
            toAddress: toAddress.value,
            assetAmounts,
            gasAmount: gasAmount ? parseInt(gasAmount) : undefined,
            gasPrice,
            lockTime
          })
        }
        disabled={!isSubmitButtonActive}
      >
        {t('Check')}
      </FooterButton>
    </>
  )
}

const buildTransaction = async (transactionData: TransferTxData, context: TxContext) => {
  const { fromAddress, toAddress, assetAmounts, gasAmount, gasPrice, lockTime } = transactionData
  const assetsWithAvailableBalance = getAddressAssetsAvailableBalance(fromAddress).filter(
    (token) => token.availableBalance > 0
  )

  const shouldSweep =
    assetsWithAvailableBalance.length === assetAmounts.length &&
    assetsWithAvailableBalance.every(
      (asset) => assetAmounts.find((a) => a.id === asset.id)?.amount === asset.availableBalance
    )

  context.setIsSweeping(shouldSweep)

  if (shouldSweep) {
    const { unsignedTxs, fees } = await buildSweepTransactions(fromAddress, toAddress)
    context.setSweepUnsignedTxs(unsignedTxs)
    context.setFees(fees)
  } else {
    const { attoAlphAmount, tokens } = getAssetAmounts(assetAmounts)

    const { data } = await client.clique.transactions.postTransactionsBuild({
      fromPublicKey: fromAddress.publicKey,
      destinations: [
        {
          address: toAddress,
          attoAlphAmount,
          tokens,
          lockTime: lockTime ? lockTime.getTime() : undefined
        }
      ],
      gasAmount: gasAmount ? gasAmount : undefined,
      gasPrice: gasPrice ? fromHumanReadableAmount(gasPrice).toString() : undefined
    })
    context.setUnsignedTransaction(data)
    context.setUnsignedTxId(data.txId)
    context.setFees(BigInt(data.gasAmount) * BigInt(data.gasPrice))
  }
}

const handleSend = async (transactionData: TransferTxData, context: TxContext) => {
  const { fromAddress, toAddress, lockTime: lockDateTime, assetAmounts } = transactionData
  const { isSweeping, sweepUnsignedTxs, consolidationRequired, unsignedTxId, unsignedTransaction } = context

  if (toAddress) {
    const { attoAlphAmount, tokens } = getAssetAmounts(assetAmounts)
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
            amount: attoAlphAmount,
            tokens,
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
          amount: attoAlphAmount,
          tokens,
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

const HorizontalDividerStyled = styled(HorizontalDivider)`
  margin: 20px 0;
`

const Content = styled.div`
  margin-top: 36px;

  & > ${Box}:not(:last-child) {
    margin-bottom: 35px;
  }
`
