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

import { convertSetToAlph } from '@alephium/sdk'
import { colord } from 'colord'
import dayjs from 'dayjs'
import { MouseEvent, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TooltipWrapper } from 'react-tooltip'
import styled, { css, useTheme } from 'styled-components'

import AddressEllipsed from '@/components/AddressEllipsed'
import Amount from '@/components/Amount'
import Badge from '@/components/Badge'
import Card from '@/components/Card'
import { useAppSelector } from '@/hooks/redux'
import { ReactComponent as RibbonSVG } from '@/images/ribbon.svg'
import AddressDetailsModal from '@/modals/AddressDetailsModal'
import ModalPortal from '@/modals/ModalPortal'
import { selectAddressByHash } from '@/storage/app-state/slices/addressesSlice'
import { selectAddressesAssets } from '@/storage/app-state/slices/addressesSlice'
import { useGetPriceQuery } from '@/storage/app-state/slices/priceApiSlice'
import { changeDefaultAddress } from '@/storage/storage-utils/addressesStorageUtils'
import { AddressHash } from '@/types/addresses'
import { currencies } from '@/utils/currencies'

interface AddressCardProps {
  hash: AddressHash
  className?: string
}

const AddressCard = ({ hash, className }: AddressCardProps) => {
  const { t } = useTranslation()
  const theme = useTheme()
  const [address, { name: walletName, mnemonic }] = useAppSelector((s) => [
    selectAddressByHash(s, hash),
    s.activeWallet
  ])
  const assets = useAppSelector((state) => selectAddressesAssets(state, address?.hash ? [address.hash] : undefined))
  const { data: price, isLoading: isPriceLoading } = useGetPriceQuery(currencies.USD.ticker)

  const [isAddressDetailsModalOpen, setIsAddressDetailsModalOpen] = useState(false)

  if (!address || !walletName || !mnemonic) return null

  const alphBalance = parseFloat(convertSetToAlph(BigInt(address.balance)))
  const fiatBalance = alphBalance * (price ?? 0)
  const assetSymbols = assets.filter((asset) => asset.balance > 0).map((asset) => asset.symbol)

  const setAsDefaultAddress = (event: MouseEvent<HTMLDivElement>) => {
    changeDefaultAddress(address, { walletName, mnemonic })
    event.stopPropagation()
  }

  return (
    <>
      <CardWithRibbon
        className={className}
        onClick={() => setIsAddressDetailsModalOpen(true)}
        onKeyPress={() => setIsAddressDetailsModalOpen(true)}
        layout
      >
        <InfoSection bgColor={address.color}>
          {address.isDefault ? (
            <DefaultAddressRibbonContainer>
              <TooltipWrapper content={t('This is the default address')} place="bottom">
                <DefaultAddressRibbon />
              </TooltipWrapper>
            </DefaultAddressRibbonContainer>
          ) : (
            <RibbonContainer onClick={setAsDefaultAddress}>
              <TooltipWrapper content={t('Set as the default address')} place="bottom">
                <Ribbon />
              </TooltipWrapper>
            </RibbonContainer>
          )}
          <Label>{address.label}</Label>
          <TotalBalance>
            {!isPriceLoading && <Amount value={fiatBalance} isFiat suffix={currencies.USD.symbol} />}
          </TotalBalance>
          <AddressEllipsedStyled addressHash={address.hash} />
          <LastActivity>
            {address.lastUsed ? `${t('Last activity')} ${dayjs(address.lastUsed).fromNow()}` : t('Never used')}
          </LastActivity>
        </InfoSection>
        <AssetsSection>
          {assetSymbols.map((symbol) => (
            <Badge rounded border transparent color={theme.font.secondary} key={symbol}>
              {symbol}
            </Badge>
          ))}
        </AssetsSection>
      </CardWithRibbon>
      <ModalPortal>
        {isAddressDetailsModalOpen && (
          <AddressDetailsModal addressHash={address.hash} onClose={() => setIsAddressDetailsModalOpen(false)} />
        )}
      </ModalPortal>
    </>
  )
}

export default AddressCard

const RibbonContainer = styled.div`
  position: absolute;
  top: -4px;
  right: 25px;
  opacity: 0;
  transition: opacity 0.2s ease-out;
`

const CardWithRibbon = styled(Card)`
  &:hover {
    ${RibbonContainer} {
      opacity: 1;
    }
  }
`

const InfoSection = styled.div<{ bgColor?: string }>`
  position: relative;
  padding: 23px 23px 15px 23px;
  border-top-left-radius: var(--radius-huge);
  border-top-right-radius: var(--radius-huge);

  ${({ theme, bgColor }) =>
    bgColor &&
    css`
      background: linear-gradient(0deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.08)),
        linear-gradient(252.71deg, ${colord(bgColor).darken(0.15).toRgbString()} 5.31%, ${bgColor} 97.85%);
      color: ${theme.name === 'dark'
        ? colord(bgColor).isDark()
          ? theme.font.primary
          : theme.font.contrastPrimary
        : colord(bgColor).isDark()
        ? theme.font.contrastPrimary
        : theme.font.primary};
    `}
`

const AssetsSection = styled.div`
  padding: 23px;
  border-top: 1px solid ${({ theme }) => theme.border.primary};
  display: flex;
  gap: 6px;
`

const LastActivity = styled.div`
  color: ${({ theme }) => theme.font.secondary}
  font-size: 11px;
  margin-top: 25px;
`

const AddressEllipsedStyled = styled(AddressEllipsed)`
  font-size: 16px;
  font-weight: var(--fontWeight-medium);
`

const Ribbon = styled(RibbonSVG)`
  opacity: 0.4;
  transition: opacity 0.2s ease-out;

  &:hover {
    opacity: 0.6;
  }
`

const DefaultAddressRibbonContainer = styled(RibbonContainer)`
  opacity: 1;
`

const DefaultAddressRibbon = styled(RibbonSVG)`
  opacity: 1;
  filter: drop-shadow(0px 3px 2px rgba(0, 0, 0, 0.1));
  cursor: auto;
`

const Label = styled.div`
  font-size: 23px;
  font-weight: var(--fontWeight-normal);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 95%;
  display: inline-block;
  min-height: 28px;
  margin-bottom: 25px;
`

const TotalBalance = styled.div`
  font-size: 28px;
  font-weight: var(--fontWeight-semiBold);
  margin-bottom: 10px;
`
