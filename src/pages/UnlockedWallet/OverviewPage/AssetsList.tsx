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

import { motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { useTheme } from 'styled-components'

import { fadeIn } from '@/animations'
import Amount from '@/components/Amount'
import AssetLogo from '@/components/AssetLogo'
import Badge from '@/components/Badge'
import FocusableContent from '@/components/FocusableContent'
import HashEllipsed from '@/components/HashEllipsed'
import SkeletonLoader from '@/components/SkeletonLoader'
import { TabItem } from '@/components/TabBar'
import { ExpandableTable, ExpandRow, TableRow } from '@/components/Table'
import TableCellAmount from '@/components/TableCellAmount'
import TableTabBar from '@/components/TableTabBar'
import Truncate from '@/components/Truncate'
import { useAppSelector } from '@/hooks/redux'
import { makeSelectAddressesTokens, selectIsStateUninitialized } from '@/storage/addresses/addressesSelectors'
import { AddressHash } from '@/types/addresses'

interface AssetsListProps {
  className?: string
  addressHashes?: AddressHash[]
  tokensTabTitle?: string
  nftsTabTitle?: string
  showTokens?: boolean
  showNfts?: boolean
  isExpanded?: boolean
  onExpand?: () => void
  maxHeightInPx?: number
}

const AssetsList = ({ className, addressHashes, tokensTabTitle, nftsTabTitle, maxHeightInPx }: AssetsListProps) => {
  const { t } = useTranslation()

  const tabs = [
    { value: 'tokens', label: tokensTabTitle ?? '💰 ' + t('Tokens') },
    { value: 'nfts', label: nftsTabTitle ?? '🖼️ ' + t('NFTs') }
  ]
  const [currentTab, setCurrentTab] = useState<TabItem>(tabs[0])
  const [isExpanded, setIsExpanded] = useState(false)

  const handleButtonClick = () => setIsExpanded(!isExpanded)

  return (
    <FocusableContent className={className} isFocused={isExpanded} onClose={() => setIsExpanded(false)}>
      <ExpandableTable isExpanded={isExpanded} maxHeightInPx={maxHeightInPx}>
        <TableTabBar items={tabs} onTabChange={(tab) => setCurrentTab(tab)} activeTab={currentTab} />
        {
          {
            tokens: (
              <TokensList
                addressHashes={addressHashes}
                isExpanded={isExpanded || !maxHeightInPx}
                onExpand={handleButtonClick}
              />
            ),
            nfts: (
              <NFTsList
                addressHashes={addressHashes}
                isExpanded={isExpanded || !maxHeightInPx}
                onExpand={handleButtonClick}
              />
            )
          }[currentTab.value]
        }
      </ExpandableTable>
    </FocusableContent>
  )
}

const TokensList = ({ className, addressHashes, isExpanded, onExpand }: AssetsListProps) => {
  const { t } = useTranslation()
  const theme = useTheme()
  const selectAddressesTokens = useMemo(makeSelectAddressesTokens, [])
  const assets = useAppSelector((s) => selectAddressesTokens(s, addressHashes))
  const stateUninitialized = useAppSelector(selectIsStateUninitialized)

  return (
    <>
      <motion.div {...fadeIn} className={className}>
        {assets.map((asset) => (
          <TableRow key={asset.id} role="row" tabIndex={isExpanded ? 0 : -1}>
            <TokenRow>
              <AssetLogoStyled assetId={asset.id} assetImageUrl={asset.logoURI} size={30} />
              <NameColumn>
                <TokenName>{asset.name ?? t('Unknown token')}</TokenName>
                <TokenSymbol>
                  {asset.symbol ?? (
                    <HashEllipsed hash={asset.id} tooltipText={t('Copy token hash')} disableCopy={!isExpanded} />
                  )}
                </TokenSymbol>
              </NameColumn>
              {!asset.verified && (
                <Column>
                  <Badge color={asset.verified === undefined ? undefined : theme.global.highlight}>
                    {asset.verified === undefined ? t('Unknown') : t('Unverified')}
                  </Badge>
                </Column>
              )}
              <TableCellAmount>
                {stateUninitialized ? (
                  <SkeletonLoader height="20px" width="30%" />
                ) : (
                  <>
                    <TokenAmount
                      value={asset.balance}
                      suffix={asset.symbol}
                      decimals={asset.decimals}
                      isUnknownToken={!asset.symbol}
                    />
                    {asset.lockedBalance > 0 && (
                      <AmountSubtitle>
                        {`${t('Available')}: `}
                        <Amount
                          value={asset.balance - asset.lockedBalance}
                          suffix={asset.symbol}
                          color={theme.font.tertiary}
                          decimals={asset.decimals}
                          isUnknownToken={!asset.symbol}
                        />
                      </AmountSubtitle>
                    )}
                    {!asset.symbol && <AmountSubtitle>{t('Raw amount')}</AmountSubtitle>}
                  </>
                )}
              </TableCellAmount>
            </TokenRow>
          </TableRow>
        ))}
      </motion.div>

      {!isExpanded && assets.length > 3 && onExpand && <ExpandRow onClick={onExpand} />}
    </>
  )
}

const NFTsList = ({ className, addressHashes, isExpanded }: AssetsListProps) => {
  const { t } = useTranslation()
  // const selectAddressesNFTs = useMemo(makeSelectAddressesNFTs, [])
  // const nfts = useAppSelector((s) => selectAddressesNFTs(s, addressHashes))

  return (
    <motion.div {...fadeIn} className={className}>
      <TableRowStyled role="row" tabIndex={isExpanded ? 0 : -1}>
        {/* {nfts.map((nft) => (
          <NFTThumbnail key={nft.id} nft={nft} />
        ))}
        {nfts.length === 0 && <PlaceholderText>{t('No NFTs found.')}</PlaceholderText>} */}
        <PlaceholderText>{t('Coming soon!')}</PlaceholderText>
      </TableRowStyled>
    </motion.div>
  )
}

export default styled(AssetsList)`
  margin-bottom: 45px;
`

const TokenRow = styled.div`
  display: flex;
  align-items: center;
  flex-grow: 1;
`

const AssetLogoStyled = styled(AssetLogo)`
  margin-right: 20px;
`

const TokenName = styled(Truncate)`
  font-size: 14px;
  font-weight: var(--fontWeight-medium);
  width: 200px;
`

const TokenSymbol = styled.div`
  color: ${({ theme }) => theme.font.tertiary};
  font-size: 12px;
  width: 200px;
`

const Column = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`

const TokenAmount = styled(Amount)`
  color: ${({ theme }) => theme.font.primary};
`

const AmountSubtitle = styled.div`
  color: ${({ theme }) => theme.font.tertiary};
  font-size: 10px;
`

const NameColumn = styled(Column)`
  margin-right: 50px;
`

const PlaceholderText = styled.div`
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
`

const TableRowStyled = styled(TableRow)`
  display: flex;
  gap: 20px;
`
