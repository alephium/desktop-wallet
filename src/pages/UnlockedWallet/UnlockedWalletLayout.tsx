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

import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { AnimatePresence, motion } from 'framer-motion'
import { Album, ArrowLeftRight, FileCode, Layers, RefreshCw, Settings, TerminalSquare } from 'lucide-react'
import { FC, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { fadeInSlowly } from '@/animations'
import AppHeader from '@/components/AppHeader'
import Button from '@/components/Button'
import NavItem from '@/components/NavItem'
import Scrollbar from '@/components/Scrollbar'
import Spinner from '@/components/Spinner'
import { useAddressesContext } from '@/contexts/addresses'
import { useGlobalContext } from '@/contexts/global'
import { useSendModalContext } from '@/contexts/sendModal'
import NotificationsModal from '@/modals/NotificationsModal'
import SendModalDeployContract from '@/modals/SendModals/SendModalDeployContract'
import SendModalScript from '@/modals/SendModals/SendModalScript'
import SendModalTransfer from '@/modals/SendModals/SendModalTransfer'
import SettingsModal from '@/modals/SettingsModal'
import { appHeaderHeightPx, walletSidebarWidthPx } from '@/style/globalStyles'
import { TxType } from '@/types/transactions'
import { getInitials } from '@/utils/misc'

interface UnlockedWalletLayoutProps {
  className?: string
}

dayjs.extend(relativeTime)

// This shall be removed once v2.0.0 is released
const hideContractButtons = true

const UnlockedWalletLayout: FC<UnlockedWalletLayoutProps> = ({ children, className }) => {
  const { t } = useTranslation()
  const { networkStatus, activeWalletName } = useGlobalContext()
  const { isSendModalOpen, openSendModal, txType } = useSendModalContext()
  const { refreshAddressesData, isLoadingData } = useAddressesContext()

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false)

  const activeWalletNameInitials = getInitials(activeWalletName)

  return (
    <>
      <motion.div {...fadeInSlowly} className={className}>
        <WalletSidebar>
          <CurrentWalletInitials
            onClick={() => setIsNotificationsModalOpen(true)}
            style={{ zIndex: isNotificationsModalOpen ? 2 : undefined }}
          >
            {activeWalletNameInitials}
          </CurrentWalletInitials>
          <SideNavigation>
            <NavItem Icon={Layers} label={t`Overview`} to="/wallet/overview" />
            <NavItem Icon={ArrowLeftRight} label={t`Send`} onClick={() => openSendModal(TxType.TRANSFER)} />
            <NavItem Icon={Album} label={t`Addresses`} to="/wallet/addresses" />
            {!hideContractButtons && (
              <>
                <NavItem Icon={TerminalSquare} label={t`Call contract`} onClick={() => openSendModal(TxType.SCRIPT)} />
                <NavItem
                  Icon={FileCode}
                  label={t`Deploy contract`}
                  onClick={() => openSendModal(TxType.DEPLOY_CONTRACT)}
                />
              </>
            )}
          </SideNavigation>
          <Button
            transparent
            squared
            onClick={() => setIsSettingsModalOpen(true)}
            aria-label={t`Settings`}
            data-tip={t`Settings`}
          >
            <Settings />
          </Button>
        </WalletSidebar>

        <Scrollbar>
          <MainContent>{children}</MainContent>

          <AppHeader>
            {networkStatus === 'online' && (
              <RefreshButton
                transparent
                squared
                onClick={refreshAddressesData}
                disabled={isLoadingData}
                aria-label={t`Refresh`}
                data-tip={t`Refresh data`}
              >
                {isLoadingData ? <Spinner /> : <RefreshCw />}
              </RefreshButton>
            )}
          </AppHeader>
        </Scrollbar>
      </motion.div>
      <AnimatePresence exitBeforeEnter initial={true}>
        {isSendModalOpen && txType === TxType.TRANSFER && <SendModalTransfer />}
        {isSendModalOpen && txType === TxType.DEPLOY_CONTRACT && <SendModalDeployContract />}
        {isSendModalOpen && txType === TxType.SCRIPT && <SendModalScript />}
        {isSettingsModalOpen && <SettingsModal onClose={() => setIsSettingsModalOpen(false)} />}
        {isNotificationsModalOpen && <NotificationsModal onClose={() => setIsNotificationsModalOpen(false)} />}
      </AnimatePresence>
    </>
  )
}

export default styled(UnlockedWalletLayout)`
  display: flex;
  width: 100%;
  height: 100%;
`

const WalletSidebar = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  width: ${walletSidebarWidthPx}px;
  padding: ${appHeaderHeightPx}px var(--spacing-4) var(--spacing-4);

  border-right: 1px solid ${({ theme }) => theme.border.primary};
  background-color: ${({ theme }) => theme.bg.tertiary};
`

const MainContent = styled.main`
  display: flex;
  flex-direction: column;
  padding-top: ${appHeaderHeightPx}px;
  min-height: 100vh;
  background-color: ${({ theme }) => theme.bg.background1};
`

const SideNavigation = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 15px;
`

const RefreshButton = styled(Button)``

const CurrentWalletInitials = styled.div`
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  border: 1px solid ${({ theme }) => theme.border.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--fontWeight-semiBold);
  font-size: 12px;
  background-color: ${({ theme }) => theme.bg.secondary};
  cursor: pointer;
`
