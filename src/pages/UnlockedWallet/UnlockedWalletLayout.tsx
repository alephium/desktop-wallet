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
import { motion } from 'framer-motion'
import { Album, Layers, RefreshCw, Settings } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TooltipWrapper } from 'react-tooltip'
import styled from 'styled-components'

import { fadeInSlowly } from '@/animations'
import AppHeader from '@/components/AppHeader'
import Button from '@/components/Button'
import NavItem from '@/components/NavItem'
import Scrollbar from '@/components/Scrollbar'
import Spinner from '@/components/Spinner'
import { useAddressesContext } from '@/contexts/addresses'
import { useGlobalContext } from '@/contexts/global'
import ModalPortal from '@/modals/ModalPortal'
import NotificationsModal from '@/modals/NotificationsModal'
import SettingsModal from '@/modals/SettingsModal'
import { appHeaderHeightPx, walletSidebarWidthPx } from '@/style/globalStyles'
import { getInitials } from '@/utils/misc'

interface UnlockedWalletLayoutProps {
  className?: string
}

dayjs.extend(relativeTime)

const UnlockedWalletLayout: FC<UnlockedWalletLayoutProps> = ({ children, className }) => {
  const { t } = useTranslation()
  const { networkStatus, activeWalletName } = useGlobalContext()
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
            <NavItem Icon={Album} label={t`Addresses`} to="/wallet/addresses" />
          </SideNavigation>
          <TooltipWrapper content={t`Settings`} tooltipId="sidenav">
            <Button
              transparent
              squared
              borderless
              onClick={() => setIsSettingsModalOpen(true)}
              aria-label={t`Settings`}
            >
              <Settings />
            </Button>
          </TooltipWrapper>
        </WalletSidebar>

        <Scrollbar>
          <MainContent>{children}</MainContent>

          <AppHeader>
            {networkStatus === 'online' && (
              <TooltipWrapper content={t`Refresh data`}>
                <RefreshButton
                  role="secondary"
                  transparent
                  squared
                  onClick={refreshAddressesData}
                  disabled={isLoadingData}
                  aria-label={t`Refresh`}
                >
                  {isLoadingData ? <Spinner /> : <RefreshCw />}
                </RefreshButton>
              </TooltipWrapper>
            )}
          </AppHeader>
        </Scrollbar>
      </motion.div>
      <ModalPortal>
        {isSettingsModalOpen && <SettingsModal onClose={() => setIsSettingsModalOpen(false)} />}
        {isNotificationsModalOpen && <NotificationsModal onClose={() => setIsNotificationsModalOpen(false)} />}
      </ModalPortal>
    </>
  )
}

export const UnlockedWalletPanel = styled.div`
  padding-left: 60px;
  padding-right: 60px;
`

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
