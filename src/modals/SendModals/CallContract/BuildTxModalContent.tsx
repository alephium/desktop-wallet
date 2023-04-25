/*
Copyright 2018 - 2023 The Alephium Authors
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
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import FooterButton from '@/components/Buttons/FooterButton'
import HorizontalDivider from '@/components/Dividers/HorizontalDivider'
import { InputFieldsColumn } from '@/components/InputFieldsColumn'
import Input from '@/components/Inputs/Input'
import ToggleSection from '@/components/ToggleSection'
import useGasSettings from '@/hooks/useGasSettings'
import useStateObject from '@/hooks/useStateObject'
import AssetAmountsInput from '@/modals/SendModals/AssetAmountsInput'
import GasSettings from '@/modals/SendModals/GasSettings'
import { AssetAmount } from '@/types/assets'
import { CallContractTxData, PartialTxData, TxPreparation } from '@/types/transactions'
import { assetAmountsWithinAvailableBalance, getAvailableBalance } from '@/utils/addresses'
import { isAmountWithinRange } from '@/utils/transactions'

interface CallContractBuildTxModalContentProps {
  data: PartialTxData<CallContractTxData, 'fromAddress'>
  onSubmit: (data: CallContractTxData) => void
  onCancel: () => void
}

const CallContractBuildTxModalContent = ({ data, onSubmit, onCancel }: CallContractBuildTxModalContentProps) => {
  const { t } = useTranslation()
  const {
    gasAmount,
    gasAmountError,
    gasPrice,
    gasPriceError,
    clearGasSettings,
    handleGasAmountChange,
    handleGasPriceChange
  } = useGasSettings(data?.gasAmount?.toString(), data?.gasPrice)

  const [txPrep, , setTxPrepProp] = useStateObject<TxPreparation>({
    fromAddress: data.fromAddress ?? '',
    bytecode: data.bytecode ?? ''
  })
  const [assetAmounts, setAssetAmounts] = useState<AssetAmount[] | undefined>(data.assetAmounts)
  const [isAmountValid, setIsAmountValid] = useState(false)

  const { fromAddress, bytecode, alphAmount } = txPrep
  const availableBalance = getAvailableBalance(fromAddress)

  useEffect(() => {
    try {
      setIsAmountValid(!alphAmount || isAmountWithinRange(fromHumanReadableAmount(alphAmount), availableBalance))
    } catch (e) {
      console.error(e)
    }
  }, [alphAmount, availableBalance])

  if (fromAddress === undefined) {
    onCancel()
    return null
  }

  const allAssetAmountsAreWithinAvailableBalance =
    assetAmounts && assetAmountsWithinAvailableBalance(fromAddress, assetAmounts)

  const isSubmitButtonActive =
    !gasPriceError && !gasAmountError && !!bytecode && isAmountValid && allAssetAmountsAreWithinAvailableBalance

  return (
    <>
      <InputFieldsColumn>
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
      <HorizontalDividerStyled />
      <ToggleSection
        title={t('Show advanced options')}
        subtitle={t('Set gas settings')}
        onClick={clearGasSettings}
        isOpen={!!gasAmount || !!gasPrice}
      >
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

export default CallContractBuildTxModalContent

const HorizontalDividerStyled = styled(HorizontalDivider)`
  margin: 20px 0;
`
