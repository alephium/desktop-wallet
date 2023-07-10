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

import { Asset } from '@alephium/sdk'
import { motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { useTheme } from 'styled-components'

import { fadeIn } from '@/animations'
import Amount from '@/components/Amount'
import AssetLogo from '@/components/AssetLogo'
import Badge from '@/components/Badge'
import FocusableContent from '@/components/FocusableContent'
import HashEllipsed from '@/components/HashEllipsed'
import NFTThumbnail from '@/components/NFTThumbnail'
import SkeletonLoader from '@/components/SkeletonLoader'
import { TabItem } from '@/components/TabBar'
import { ExpandableTable, ExpandRow, TableRow } from '@/components/Table'
import TableCellAmount from '@/components/TableCellAmount'
import TableTabBar from '@/components/TableTabBar'
import Truncate from '@/components/Truncate'
import { useAppSelector } from '@/hooks/redux'
import {
  makeSelectAddressesCheckedUnknownTokens,
  makeSelectAddressesKnownFungibleTokens,
  makeSelectAddressesNFTs,
  selectIsStateUninitialized
} from '@/storage/addresses/addressesSelectors'
import { AddressHash } from '@/types/addresses'

interface AssetsListProps {
  className?: string
  addressHashes?: AddressHash[]
  tokensTabTitle?: string
  unknownTokensTabTitle?: string
  nftsTabTitle?: string
  showTokens?: boolean
  showNfts?: boolean
  isExpanded?: boolean
  onExpand?: () => void
  maxHeightInPx?: number
}

const AssetsList = ({
  className,
  addressHashes,
  tokensTabTitle,
  unknownTokensTabTitle,
  nftsTabTitle,
  maxHeightInPx
}: AssetsListProps) => {
  const { t } = useTranslation()
  const selectAddressesCheckedUnknownTokens = useMemo(makeSelectAddressesCheckedUnknownTokens, [])
  const unknownTokens = useAppSelector((s) => selectAddressesCheckedUnknownTokens(s, addressHashes))

  const [tabs, setTabs] = useState([
    { value: 'tokens', label: tokensTabTitle ?? '💰 ' + t('Tokens') },
    { value: 'nfts', label: nftsTabTitle ?? '🖼️ ' + t('NFTs') }
  ])
  const [currentTab, setCurrentTab] = useState<TabItem>(tabs[0])
  const [isExpanded, setIsExpanded] = useState(false)

  const handleButtonClick = () => setIsExpanded(!isExpanded)

  useEffect(() => {
    if (unknownTokens.length > 0 && tabs.length === 2) {
      setTabs([...tabs, { value: 'unknownTokens', label: unknownTokensTabTitle ?? '❔' + t('Unknown tokens') }])
    }
  }, [t, tabs, unknownTokens.length, unknownTokensTabTitle])

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
            ),
            unknownTokens: (
              <UnknownTokensList
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
  const selectAddressesKnownFungibleTokens = useMemo(makeSelectAddressesKnownFungibleTokens, [])
  const knownFungibleTokens = useAppSelector((s) => selectAddressesKnownFungibleTokens(s, addressHashes))
  const stateUninitialized = useAppSelector(selectIsStateUninitialized)
  const isLoadingTokensMetadata = useAppSelector((s) => s.assetsInfo.loading)

  return (
    <>
      <motion.div {...fadeIn} className={className}>
        {knownFungibleTokens.map((asset) => (
          <TokenListRow asset={asset} isExpanded={isExpanded} key={asset.id} />
        ))}
        {(isLoadingTokensMetadata || stateUninitialized) && (
          <TableRow>
            <SkeletonLoader height="37.5px" />
          </TableRow>
        )}
      </motion.div>

      {!isExpanded && knownFungibleTokens.length > 3 && onExpand && <ExpandRow onClick={onExpand} />}
    </>
  )
}

const UnknownTokensList = ({ className, addressHashes, isExpanded, onExpand }: AssetsListProps) => {
  const selectAddressesCheckedUnknownTokens = useMemo(makeSelectAddressesCheckedUnknownTokens, [])
  const unknownTokens = useAppSelector((s) => selectAddressesCheckedUnknownTokens(s, addressHashes))

  return (
    <>
      <motion.div {...fadeIn} className={className}>
        {unknownTokens.map((asset) => (
          <TokenListRow asset={asset} isExpanded={isExpanded} key={asset.id} />
        ))}
      </motion.div>

      {!isExpanded && unknownTokens.length > 3 && onExpand && <ExpandRow onClick={onExpand} />}
    </>
  )
}

interface TokenListRowProps {
  asset: Asset
  isExpanded: AssetsListProps['isExpanded']
}

const TokenListRow = ({ asset, isExpanded }: TokenListRowProps) => {
  const { t } = useTranslation()
  const theme = useTheme()
  const stateUninitialized = useAppSelector(selectIsStateUninitialized)

  return (
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
  )
}

const NFTsList = ({ className, addressHashes, isExpanded, onExpand }: AssetsListProps) => {
  const { t } = useTranslation()
  const selectAddressesNFTs = useMemo(makeSelectAddressesNFTs, [])
  const nfts = useAppSelector((s) => selectAddressesNFTs(s, addressHashes))
  const stateUninitialized = useAppSelector(selectIsStateUninitialized)
  const isLoadingTokensMetadata = useAppSelector((s) => s.assetsInfo.loading)

  return (
    <>
      <motion.div {...fadeIn} className={className}>
        {isLoadingTokensMetadata || stateUninitialized ? (
          <TableRow>
            <SkeletonLoader height="37.5px" />
          </TableRow>
        ) : (
          <TableRowStyled role="row" tabIndex={isExpanded ? 0 : -1}>
            {nfts.map((nft) => (
              <NFTThumbnail key={nft.id} nft={nft} />
            ))}
            {nfts.length === 0 && <PlaceholderText>{t('No NFTs found.')}</PlaceholderText>}
          </TableRowStyled>
        )}
      </motion.div>

      {!isExpanded && nfts.length > 10 && onExpand && <ExpandRow onClick={onExpand} />}
    </>
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
  flex-wrap: wrap;
`
