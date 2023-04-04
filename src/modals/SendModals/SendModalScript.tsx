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
import { PostHog } from 'posthog-js'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import client from '@/api/client'
import { signAndSendTransaction } from '@/api/transactions'
import Box from '@/components/Box'
import FooterButton from '@/components/Buttons/FooterButton'
import InfoBox from '@/components/InfoBox'
import { InputFieldsColumn } from '@/components/InputFieldsColumn'
import Input from '@/components/Inputs/Input'
import ToggleSection from '@/components/ToggleSection'
import { useAppSelector } from '@/hooks/redux'
import useDappTxData from '@/hooks/useDappTxData'
import useGasSettings from '@/hooks/useGasSettings'
import useStateObject from '@/hooks/useStateObject'
import AddressInputs from '@/modals/SendModals/AddressInputs'
import AssetAmountsInput from '@/modals/SendModals/AssetAmountsInput'
import CheckAddressesBox from '@/modals/SendModals/CheckAddressesBox'
import CheckAmountsBox from '@/modals/SendModals/CheckAmountsBox'
import CheckFeeLockTimeBox from '@/modals/SendModals/CheckFeeLockTimeBox'
import GasSettings from '@/modals/SendModals/GasSettings'
import SendModal from '@/modals/SendModals/SendModal'
import { selectAllAddresses } from '@/storage/addresses/addressesSelectors'
import { store } from '@/storage/store'
import { transactionSent } from '@/storage/transactions/transactionsActions'
import { AssetAmount } from '@/types/assets'
import { CheckTxProps, PartialTxData, ScriptTxData, TxContext, TxPreparation } from '@/types/transactions'
import { assetAmountsWithinAvailableBalance, getAvailableBalance } from '@/utils/addresses'
import { getOptionalTransactionAssetAmounts, isAmountWithinRange } from '@/utils/transactions'

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
      title={t('Call contract')}
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

const ScriptCheckTxModalContent = ({ data, fees, onSubmit }: CheckTxProps<ScriptTxData>) => {
  const { t } = useTranslation()
  const settings = useAppSelector((s) => s.settings)

  return (
    <>
      <Content>
        {data.assetAmounts && <CheckAmountsBox assetAmounts={data.assetAmounts} />}
        <CheckAddressesBox fromAddress={data.fromAddress} />
        <CheckFeeLockTimeBox fee={fees} />
        <InfoBox label={t('Bytecode')} text={data.bytecode} wordBreak />
      </Content>
      <FooterButton onClick={onSubmit} variant={settings.passwordRequirement ? 'default' : 'valid'}>
        {t(settings.passwordRequirement ? 'Confirm' : 'Send')}
      </FooterButton>
    </>
  )
}

const ScriptBuildTxModalContent = ({ data, onSubmit, onCancel }: ScriptBuildTxModalContentProps) => {
  const { t } = useTranslation()
  const addresses = useAppSelector(selectAllAddresses)
  const [txPrep, , setTxPrepProp] = useStateObject<TxPreparation>({
    fromAddress: data.fromAddress ?? '',
    bytecode: data.bytecode ?? ''
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

  const [assetAmounts, setAssetAmounts] = useState<AssetAmount[] | undefined>(data.assetAmounts)

  const { fromAddress, bytecode, alphAmount } = txPrep
  const availableBalance = getAvailableBalance(fromAddress)

  if (fromAddress === undefined) {
    onCancel()
    return null
  }

  const allAssetAmountsAreWithinAvailableBalance =
    assetAmounts && assetAmountsWithinAvailableBalance(fromAddress, assetAmounts)

  const isSubmitButtonActive =
    !gasPriceError &&
    !gasAmountError &&
    !!bytecode &&
    (!alphAmount || isAmountWithinRange(fromHumanReadableAmount(alphAmount), availableBalance)) &&
    allAssetAmountsAreWithinAvailableBalance

  return (
    <>
      <InputFieldsColumn>
        <AddressInputs
          defaultFromAddress={fromAddress}
          fromAddresses={addresses}
          onFromAddressChange={setTxPrepProp('fromAddress')}
        />
        {assetAmounts && (
          <AssetAmountsInput
            address={fromAddress}
            assetAmounts={assetAmounts}
            onAssetAmountsChange={setAssetAmounts}
            id="asset-amounts"
          />
        )}
        <Input
          id="code"
          label={t('Bytecode')}
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
            assetAmounts,
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
  const { attoAlphAmount, tokens } = getOptionalTransactionAssetAmounts(txData.assetAmounts)

  const response = await client.web3.contracts.postContractsUnsignedTxExecuteScript({
    fromPublicKey: txData.fromAddress.publicKey,
    bytecode: txData.bytecode,
    attoAlphAmount,
    tokens,
    gasAmount: txData.gasAmount,
    gasPrice: txData.gasPrice ? fromHumanReadableAmount(txData.gasPrice).toString() : undefined
  })
  ctx.setUnsignedTransaction(response)
  ctx.setUnsignedTxId(response.txId)
  ctx.setFees(BigInt(response.gasAmount) * BigInt(response.gasPrice))
}

const handleSend = async ({ fromAddress, assetAmounts }: ScriptTxData, ctx: TxContext, posthog?: PostHog) => {
  if (!ctx.unsignedTransaction) throw Error('No unsignedTransaction available')

  const { attoAlphAmount, tokens } = getOptionalTransactionAssetAmounts(assetAmounts)
  const data = await signAndSendTransaction(fromAddress, ctx.unsignedTxId, ctx.unsignedTransaction.unsignedTx)

  store.dispatch(
    transactionSent({
      hash: data.txId,
      fromAddress: fromAddress.hash,
      toAddress: '',
      amount: attoAlphAmount,
      tokens,
      timestamp: new Date().getTime(),
      type: 'contract',
      status: 'pending'
    })
  )

  posthog?.capture('Called smart contract')

  return data.signature
}

const getWalletConnectResult = (context: TxContext, signature: string): SignExecuteScriptTxResult => {
  if (!context.unsignedTransaction) throw Error('No unsignedTransaction available')

  return {
    groupIndex: context.unsignedTransaction.fromGroup,
    unsignedTx: context.unsignedTransaction.unsignedTx,
    txId: context.unsignedTxId,
    signature,
    gasAmount: context.unsignedTransaction.gasAmount,
    gasPrice: BigInt(context.unsignedTransaction.gasPrice)
  }
}

export default ScriptTxModal

// TODO: DRY
const Content = styled.div`
  padding-top: 36px;

  & > ${Box}:not(:last-child) {
    margin-bottom: 35px;
  }
`
