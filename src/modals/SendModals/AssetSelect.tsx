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

import { MoreVertical } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import Amount from '@/components/Amount'
import AssetLogo from '@/components/AssetLogo'
import { inputDefaultStyle, InputLabel, InputProps } from '@/components/Inputs'
import Option from '@/components/Inputs/Option'
import { MoreIcon, SelectContainer } from '@/components/Inputs/Select'
import { sectionChildrenVariants } from '@/components/PageComponents/PageContainers'
import { useAppSelector } from '@/hooks/redux'
import CenteredModal, { ModalFooterButton, ModalFooterButtons } from '@/modals/CenteredModal'
import ModalPortal from '@/modals/ModalPortal'
import { selectAddressesAlphAsset, selectAddressesAssets } from '@/storage/app-state/slices/addressesSlice'
import { AddressHash } from '@/types/addresses'
import { Asset } from '@/types/tokens'

interface AssetSelectProps {
  addressHash: AddressHash
  id: string
  onAssetChange: (assetId: Asset['id']) => void
  defaultAsset?: Asset
  className?: string
}

const AssetSelect = ({ addressHash, id, className, defaultAsset }: AssetSelectProps) => {
  const { t } = useTranslation()
  const addressAssets = useAppSelector((state) => selectAddressesAssets(state, [addressHash]))
  const alph = useAppSelector((state) => selectAddressesAlphAsset(state, [addressHash]))

  const [canBeAnimated, setCanBeAnimated] = useState(false)
  const [isAssetSelectModalOpen, setIsAssetSelectModalOpen] = useState(false)
  const [asset, setAsset] = useState(defaultAsset ?? alph)

  const disabled = addressAssets.length <= 1

  useEffect(() => {
    if (asset && !addressAssets.find((a) => a.id === asset.id)) setAsset(defaultAsset ?? alph)
  }, [addressAssets, alph, asset, defaultAsset])

  return (
    <>
      <SelectContainer
        variants={sectionChildrenVariants}
        animate={canBeAnimated ? (!disabled ? 'shown' : 'disabled') : false}
        onAnimationComplete={() => setCanBeAnimated(true)}
        custom={disabled}
        onMouseDown={() => !disabled && setIsAssetSelectModalOpen(true)}
      >
        <InputLabel inputHasValue htmlFor={id}>
          {t('Asset')}
        </InputLabel>
        {!disabled && (
          <MoreIcon>
            <MoreVertical />
          </MoreIcon>
        )}
        <ClickableInput type="button" className={className} disabled={disabled} id={id}>
          <AssetLogo asset={asset} size={20} />
          <AssetName>
            {asset.name} ({asset.symbol})
          </AssetName>
        </ClickableInput>
      </SelectContainer>
      <ModalPortal>
        {isAssetSelectModalOpen && (
          <AssetSelectModal
            options={addressAssets}
            selectedOption={asset}
            onAssetSelect={setAsset}
            onClose={() => setIsAssetSelectModalOpen(false)}
          />
        )}
      </ModalPortal>
    </>
  )
}

const AssetSelectModal = ({
  options,
  selectedOption,
  onAssetSelect,
  onClose
}: {
  options: Asset[]
  selectedOption?: Asset
  onAssetSelect: (asset: Asset) => void | undefined
  onClose: () => void
}) => {
  const { t } = useTranslation()

  const onOptionAddressSelect = (asset: Asset) => {
    onAssetSelect(asset)
    onClose()
  }

  return (
    <CenteredModal title={t('Assets')} onClose={onClose}>
      <div>
        {options.map((asset) => (
          <Option
            key={asset.id}
            onSelect={() => onOptionAddressSelect(asset)}
            isSelected={selectedOption?.id === asset.id}
          >
            <AssetLogo asset={asset} size={20} />
            <AssetName>
              {asset.name} ({asset.symbol})
            </AssetName>
            <AmountStyled value={asset.balance} fadeDecimals suffix={asset.symbol} />
          </Option>
        ))}
      </div>
      <ModalFooterButtons>
        <ModalFooterButton role="secondary" onClick={onClose}>
          {t('Close')}
        </ModalFooterButton>
      </ModalFooterButtons>
    </CenteredModal>
  )
}

export default AssetSelect

const ClickableInput = styled.div<InputProps>`
  ${({ isValid, Icon }) => inputDefaultStyle(isValid || !!Icon, true, true)};
  display: flex;
  align-items: center;
  padding-right: 50px;
  gap: var(--spacing-2);
  cursor: pointer;
`

const AmountStyled = styled(Amount)`
  flex: 1;
  text-align: right;
`

const AssetName = styled.div``
