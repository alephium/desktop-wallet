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

import { fromHumanReadableAmount, getNumberOfDecimals, MIN_UTXO_SET_AMOUNT, toHumanReadableAmount } from '@alephium/sdk'
import { Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { useTheme } from 'styled-components'

import ActionLink from '@/components/ActionLink'
import Amount from '@/components/Amount'
import AssetLogo from '@/components/AssetLogo'
import Box from '@/components/Box'
import Button from '@/components/Button'
import { inputDefaultStyle, InputLabel, InputProps } from '@/components/Inputs'
import Input from '@/components/Inputs/Input'
import { SelectContainer, SelectOption, SelectOptionsModal } from '@/components/Inputs/Select'
import SelectOptionItemContent from '@/components/Inputs/SelectOptionItemContent'
import HorizontalDivider from '@/components/PageComponents/HorizontalDivider'
import { useAppSelector } from '@/hooks/redux'
import ModalPortal from '@/modals/ModalPortal'
import InputsSection from '@/modals/SendModals/InputsSection'
import { selectAddressesAssets } from '@/storage/app-state/slices/addressesSlice'
import { ALPH } from '@/storage/app-state/slices/assetsInfoSlice'
import { Address } from '@/types/addresses'
import { Asset, AssetAmount } from '@/types/assets'

interface AssetAmountsInputProps {
  address: Address
  assetAmounts: AssetAmount[]
  onAssetAmountsChange: (assetAmounts: AssetAmount[]) => void
  id: string
  className?: string
}

const AssetAmountsInput = ({ address, assetAmounts, onAssetAmountsChange, className }: AssetAmountsInputProps) => {
  const { t } = useTranslation()
  const theme = useTheme()
  const assets = useAppSelector((state) => selectAddressesAssets(state, [address.hash]))

  const [isAssetSelectModalOpen, setIsAssetSelectModalOpen] = useState(false)
  const [selectedAssetRowIndex, setSelectedAssetRowIndex] = useState(0)
  const [errors, setErrors] = useState<string[]>([])

  const selectedAssetId = assetAmounts[selectedAssetRowIndex].id
  const selectedAsset = assets.find((asset) => asset.id === selectedAssetId)
  const minAmountInAlph = toHumanReadableAmount(MIN_UTXO_SET_AMOUNT)
  const selectedAssetIds = assetAmounts.map(({ id }) => id)
  const remainingAvailableAssets = assets.filter((asset) => !selectedAssetIds.includes(asset.id))
  const disabled = remainingAvailableAssets.length === 0
  const availableAssetOptions: SelectOption<Asset['id']>[] = remainingAvailableAssets.map((asset) => ({
    value: asset.id,
    label: asset.name
  }))

  const openAssetSelectModal = (assetRowIndex: number) => {
    setSelectedAssetRowIndex(assetRowIndex)
    setIsAssetSelectModalOpen(true)
  }

  const handleAssetSelect = (asset: Asset) => {
    const newAssetAmounts = [...assetAmounts]
    newAssetAmounts.splice(selectedAssetRowIndex, 1, {
      id: asset.id
    })
    onAssetAmountsChange(newAssetAmounts)
  }

  const handleAssetAmountChange = (assetRowIndex: number, amountInput: string) => {
    const selectedAssetId = assetAmounts[assetRowIndex].id
    const selectedAsset = assets.find((asset) => asset.id === selectedAssetId)

    if (!selectedAsset) return

    const amountValueAsFloat = parseFloat(amountInput)
    const tooManyDecimals = getNumberOfDecimals(amountInput) > (selectedAsset?.decimals ?? 0)

    const availableAmount = toHumanReadableAmount(
      selectedAsset.balance - selectedAsset.lockedBalance,
      selectedAsset.decimals
    )
    const newError =
      amountValueAsFloat > parseFloat(availableAmount)
        ? t('Amount exceeds available balance')
        : selectedAssetId === ALPH.id && amountValueAsFloat < parseFloat(minAmountInAlph)
        ? t('Amount must be greater than {{ minAmountInAlph }}', { minAmountInAlph })
        : tooManyDecimals
        ? t('This asset cannot have more than {{ decimals }} decimals', { decimals: selectedAsset.decimals })
        : ''

    const newErrors = [...errors]
    newErrors.splice(assetRowIndex, 1, newError)
    setErrors(newErrors)

    const amount = !amountInput ? undefined : fromHumanReadableAmount(amountInput, selectedAsset.decimals)
    const newAssetAmounts = [...assetAmounts]
    newAssetAmounts.splice(assetRowIndex, 1, {
      id: selectedAssetId,
      amount
    })
    onAssetAmountsChange(newAssetAmounts)
  }

  const handleAddAssetClick = () => {
    if (remainingAvailableAssets.length > 0) {
      const newAssetAmounts = [...assetAmounts]
      newAssetAmounts.push({
        id: remainingAvailableAssets[0].id
      })
      onAssetAmountsChange(newAssetAmounts)
    }
  }

  const handleAssetSelectModalClose = () => {
    setIsAssetSelectModalOpen(false)
  }

  const selectAsset = (option: SelectOption<Asset['id']>) => {
    const asset = remainingAvailableAssets.find((asset) => asset.id === option.value)
    asset && handleAssetSelect(asset)
  }

  useEffect(() => {
    const addressTokenIds = address.tokens.map((token) => token.id)
    const filteredAssetAmounts = assetAmounts.filter(
      (asset) => addressTokenIds.includes(asset.id) || asset.id === ALPH.id
    )

    if (filteredAssetAmounts.length === 0) {
      filteredAssetAmounts.push({ id: ALPH.id })
    }

    setSelectedAssetRowIndex(0)
    onAssetAmountsChange(filteredAssetAmounts)

    // We want to potentially update the list of assets ONLY when the address changes because the newly chosen address
    // might not have the tokens that were selected before
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address])

  return (
    <InputsSection title={t(assetAmounts.length < 2 ? 'Asset' : 'Assets')} className={className}>
      <AssetAmounts>
        {assetAmounts.map(({ id, amount }, index) => {
          const asset = assets.find((asset) => asset.id === id)
          if (!asset) return

          const amountValue = amount ? toHumanReadableAmount(amount, asset.decimals) : ''
          const availableAmount = asset.balance - asset.lockedBalance
          const availableHumanReadableAmount = toHumanReadableAmount(availableAmount, asset.decimals)

          return (
            <BoxStyled key={id}>
              <AssetSelect onMouseDown={() => !disabled && openAssetSelectModal(index)}>
                <InputLabel inputHasValue htmlFor={id}>
                  {t('Asset')}
                </InputLabel>
                <SelectInput type="button" className={className} disabled={disabled} id={id}>
                  <AssetLogo asset={asset} size={20} />
                  <AssetName>
                    {asset.name} ({asset.symbol})
                  </AssetName>
                </SelectInput>
              </AssetSelect>
              <HorizontalDividerStyled />
              <AssetAmountRow>
                <AssetAmountInput
                  value={amountValue}
                  onChange={(e) => handleAssetAmountChange(index, e.target.value)}
                  onClick={() => setSelectedAssetRowIndex(index)}
                  onMouseDown={() => setSelectedAssetRowIndex(index)}
                  type="number"
                  min={asset.id === ALPH.id ? minAmountInAlph : 0}
                  max={availableHumanReadableAmount}
                  aria-label={t('Amount')}
                  label={`${t('Amount')} (${asset.symbol})`}
                  error={errors[index]}
                />

                <AvailableAmountColumn>
                  <AvailableAmount tabIndex={0}>
                    <Amount
                      value={availableAmount}
                      nbOfDecimalsToShow={4}
                      color={theme.font.secondary}
                      suffix={asset.symbol}
                      decimals={asset.decimals}
                    />
                    <span> {t('Available').toLowerCase()}</span>
                  </AvailableAmount>
                  <ActionLink onClick={() => handleAssetAmountChange(index, availableHumanReadableAmount)}>
                    {t('Use max amount')}
                  </ActionLink>
                </AvailableAmountColumn>
              </AssetAmountRow>
            </BoxStyled>
          )
        })}
      </AssetAmounts>
      {assetAmounts.length < assets.length && (
        <AddAssetSection>
          <Button role="secondary" Icon={Plus} short onClick={handleAddAssetClick}>
            {t('Add asset')}
          </Button>
        </AddAssetSection>
      )}
      <ModalPortal>
        {isAssetSelectModalOpen && selectedAsset && remainingAvailableAssets.length > 0 && (
          <SelectOptionsModal
            title={t('Select an asset')}
            options={availableAssetOptions}
            selectedOption={availableAssetOptions.find((option) => option.value === selectedAsset.id)}
            setValue={selectAsset}
            onClose={handleAssetSelectModalClose}
            optionRender={(option) => {
              const asset = remainingAvailableAssets.find((asset) => asset.id === option.value)
              if (asset)
                return (
                  <SelectOptionItemContent
                    ContentLeft={
                      <AssetName>
                        <AssetLogo asset={asset} size={20} />
                        {asset.name} ({asset.symbol})
                      </AssetName>
                    }
                    ContentRight={
                      <AmountStyled
                        value={asset.balance}
                        fadeDecimals
                        suffix={asset.symbol}
                        decimals={asset.decimals}
                      />
                    }
                  />
                )
            }}
          />
        )}
      </ModalPortal>
    </InputsSection>
  )
}

export default AssetAmountsInput

const BoxStyled = styled(Box)`
  padding: 10px;
`

const AssetSelect = styled(SelectContainer)`
  margin: 0;
`

const SelectInput = styled.div<InputProps>`
  ${({ isValid, Icon }) => inputDefaultStyle(isValid || !!Icon, true, true)};
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  border: 0;
  cursor: ${({ disabled }) => (disabled ? 'auto' : 'pointer')};

  &:not(:hover) {
    background-color: transparent;
  }
`

const AmountStyled = styled(Amount)`
  font-weight: var(--fontWeight-semiBold);
`

const AssetName = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`

const AssetAmountInput = styled(Input)`
  margin: 0;
  border: 0;

  &:not(:hover) {
    background-color: transparent;
  }
`

const HorizontalDividerStyled = styled(HorizontalDivider)`
  margin: 10px 0;
`

const AssetAmountRow = styled.div`
  position: relative;
`

const AvailableAmountColumn = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-end;
  gap: 5px;
  font-size: 11px;
  position: absolute;
  right: 15px;
  top: 0;
  height: 100%;
`

const AvailableAmount = styled.div`
  color: ${({ theme }) => theme.font.secondary};
`

const AddAssetSection = styled.div`
  display: flex;
  justify-content: center;
  margin: 13px 0;
`

const AssetAmounts = styled.div`
  & > :not(:last-child) {
    margin-bottom: 20px;
  }
`
