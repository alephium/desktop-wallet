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

import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { motion } from 'framer-motion'
import { Album, ArrowLeftRight, Layers, RefreshCw } from 'lucide-react'
import { usePostHog } from 'posthog-js/react'
import { ReactNode, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { css } from 'styled-components'

import { fadeInSlowly } from '@/animations'
import AppHeader from '@/components/AppHeader'
import Button from '@/components/Button'
import NavItem from '@/components/NavItem'
import SideBar from '@/components/PageComponents/SideBar'
import Scrollbar from '@/components/Scrollbar'
import Spinner from '@/components/Spinner'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import ModalPortal from '@/modals/ModalPortal'
import NotificationsModal from '@/modals/NotificationsModal'
import { syncAddressesData } from '@/storage/addresses/addressesActions'
import { appHeaderHeightPx } from '@/style/globalStyles'
import { getInitials } from '@/utils/misc'

interface UnlockedWalletLayoutProps {
  title?: string
  className?: string
  children?: ReactNode
}

dayjs.extend(relativeTime)

const UnlockedWalletLayout = ({ children, title, className }: UnlockedWalletLayoutProps) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const networkStatus = useAppSelector((s) => s.network.status)
  const activeWalletName = useAppSelector((s) => s.activeWallet.name)
  const isLoadingData = useAppSelector((s) => s.addresses.loading)
  const posthog = usePostHog()

  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false)

  if (!activeWalletName) return null

  const activeWalletNameInitials = getInitials(activeWalletName)

  const refreshAddressesData = () => {
    dispatch(syncAddressesData())

    posthog?.capture('Refreshed data')
  }

  return (
    <>
      <motion.div {...fadeInSlowly} className={className}>
        <SideBar>
          <CurrentWalletInitials
            onClick={() => setIsNotificationsModalOpen(true)}
            style={{ zIndex: isNotificationsModalOpen ? 2 : undefined }}
          >
            {activeWalletNameInitials}
          </CurrentWalletInitials>
          <SideNavigation>
            <NavItem Icon={Layers} label={t('Overview')} to="/wallet/overview" />
            <NavItem Icon={ArrowLeftRight} label={t('Transfers')} to="/wallet/transfers" />
            <NavItem Icon={Album} label={t('Addresses')} to="/wallet/addresses" />
          </SideNavigation>
        </SideBar>

        <Scrollbar>
          <MainContent>{children}</MainContent>

          <AppHeader title={title}>
            {networkStatus === 'online' && (
              <RefreshButton
                role="secondary"
                transparent
                squared
                short
                onClick={refreshAddressesData}
                disabled={isLoadingData}
                aria-label={t('Refresh')}
                data-tooltip-id="default"
                data-tooltip-content={t('Refresh data')}
              >
                {isLoadingData ? <Spinner /> : <RefreshCw />}
              </RefreshButton>
            )}
          </AppHeader>
        </Scrollbar>
      </motion.div>
      <ModalPortal>
        {isNotificationsModalOpen && <NotificationsModal onClose={() => setIsNotificationsModalOpen(false)} />}
      </ModalPortal>
    </>
  )
}

export const UnlockedWalletPanel = styled.div<{ top?: boolean; bottom?: boolean }>`
  padding-left: 60px;
  padding-right: 60px;

  ${({ top }) =>
    top &&
    css`
      padding-top: 22px;
    `}

  ${({ bottom }) =>
    bottom &&
    css`
      padding-bottom: 60px;
    `}
`

export default styled(UnlockedWalletLayout)`
  display: flex;
  width: 100%;
  height: 100%;
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
