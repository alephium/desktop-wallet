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
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { fadeIn } from '@/animations'
import Box from '@/components/Box'
import ShortcutButtons from '@/components/Buttons/ShortcutButtons'
import { TableHeader } from '@/components/Table'
import TransactionList from '@/components/TransactionList'
import AddressesContactsList from '@/pages/UnlockedWallet/OverviewPage/AddressesContactsList'
import AmountsOverviewPanel from '@/pages/UnlockedWallet/OverviewPage/AmountsOverviewPanel'
import AssetsList from '@/pages/UnlockedWallet/OverviewPage/AssetsList'
import GreetingMessages from '@/pages/UnlockedWallet/OverviewPage/GreetingMessages'
import { UnlockedWalletPanel } from '@/pages/UnlockedWallet/UnlockedWalletLayout'
import { appHeaderHeightPx } from '@/style/globalStyles'

interface OverviewPageProps {
  className?: string
}

const OverviewPage = ({ className }: OverviewPageProps) => {
  const { t } = useTranslation()

  const [showChart, setShowChart] = useState(false)

  return (
    <motion.div
      className={className}
      {...fadeIn}
      onAnimationComplete={() => setShowChart(true)}
      onAnimationStart={() => setShowChart(false)}
    >
      <GreetingMessages />
      <AmountsOverviewPanel showChart={showChart}>
        <Shortcuts>
          <ShortcutsHeader title={t('Shortcuts')} />
          <ButtonsGrid>
            <ShortcutButtons send receive lock walletSettings analyticsOrigin="overview_page" solidBackground />
          </ButtonsGrid>
        </Shortcuts>
      </AmountsOverviewPanel>
      <UnlockedWalletPanel bottom>
        <AssetAndAddressesRow>
          <AssetsListStyled />
          <AddressesContactsListStyled limit={5} />
        </AssetAndAddressesRow>
        <TransactionList title={t('Latest transactions')} limit={5} />
      </UnlockedWalletPanel>
    </motion.div>
  )
}

export default styled(OverviewPage)`
  // Custom bg color, cover header
  background-color: ${({ theme }) => theme.bg.background1};
  margin-top: -${appHeaderHeightPx}px;
  padding-top: ${appHeaderHeightPx}px;
`

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

const Shortcuts = styled(Box)`
  overflow: hidden;
  z-index: 1;
  border: 1px solid ${({ theme }) => theme.border.primary};
  border-radius: var(--radius-big);
  background-color: ${({ theme }) => theme.bg.secondary};
`

const ShortcutsHeader = styled(TableHeader)`
  height: 45px;
  background-color: transparent;
`

const ButtonsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1px;
  background-color: ${({ theme }) => theme.border.secondary};
`
