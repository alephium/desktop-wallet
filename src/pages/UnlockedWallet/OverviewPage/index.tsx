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
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { fadeIn } from '@/animations'
import Box from '@/components/Box'
import ShortcutButtons from '@/components/Buttons/ShortcutButtons'
import HistoricalPriceChart from '@/components/HistoricalPriceChart'
import { TableHeader } from '@/components/Table'
import TransactionList from '@/components/TransactionList'
import { useAppSelector } from '@/hooks/redux'
import AddressesContactsList from '@/pages/UnlockedWallet/OverviewPage/AddressesContactsList'
import AmountsOverviewPanel from '@/pages/UnlockedWallet/OverviewPage/AmountsOverviewPanel'
import AssetsList from '@/pages/UnlockedWallet/OverviewPage/AssetsList'
import { UnlockedWalletPanel } from '@/pages/UnlockedWallet/UnlockedWalletLayout'
import { selectAddressIds } from '@/storage/addresses/addressesSelectors'
import { AddressHash } from '@/types/addresses'
import { currencies } from '@/utils/currencies'

const OverviewPage = () => {
  const { t } = useTranslation()
  const activeWalletName = useAppSelector((s) => s.activeWallet.name)
  const addressHashes = useAppSelector(selectAddressIds) as AddressHash[]

  return (
    <motion.div {...fadeIn}>
      <UnlockedWalletPanel top>
        <WalletNameRow>
          <Tagline>{t('Current wallet')}</Tagline>
          <WalletName>{activeWalletName}</WalletName>
        </WalletNameRow>

        <AmountsOverviewPanel>
          <Shortcuts>
            <ShortcutsHeader title={t('Shortcuts')} />
            <ButtonsGrid>
              <ShortcutButtons send receive lock walletSettings analyticsOrigin="overview_page" />
            </ButtonsGrid>
          </Shortcuts>
        </AmountsOverviewPanel>

        <ChartContainer>
          <HistoricalPriceChart addressHashes={addressHashes} currency={currencies.USD.ticker} />
        </ChartContainer>

        <AssetAndAddressesRow>
          <AssetsListStyled />
          <AddressesContactsListStyled limit={5} />
        </AssetAndAddressesRow>
        <TransactionList title={t('Latest transactions')} limit={5} />
      </UnlockedWalletPanel>
    </motion.div>
  )
}

export default OverviewPage

const AssetAndAddressesRow = styled.div`
  display: flex;
  gap: 30px;
  margin-top: 100px;
`

const AssetsListStyled = styled(AssetsList)`
  flex: 2;
`

const AddressesContactsListStyled = styled(AddressesContactsList)`
  flex: 1;
`

const WalletNameRow = styled.div``

const WalletName = styled.div`
  font-size: 32px;
  font-weight: var(--fontWeight-semiBold);
`

const Tagline = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.font.tertiary};
`

const Shortcuts = styled(Box)`
  overflow: hidden;
  background-color: transparent;
  z-index: 1;
`

const ShortcutsHeader = styled(TableHeader)`
  height: 50px;
`

const ButtonsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1px;
  background-color: ${({ theme }) => theme.border.primary};
`

const ChartContainer = styled.div`
  position: absolute;
  right: 0;
  left: 0;
  top: 330px;
  height: 100px;
`
