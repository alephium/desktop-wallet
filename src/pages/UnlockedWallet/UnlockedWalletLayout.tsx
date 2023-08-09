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
import { AnimatePresence, motion } from 'framer-motion'
import { Album, ArrowLeftRight, Layers, RefreshCw } from 'lucide-react'
import { usePostHog } from 'posthog-js/react'
import { ReactNode, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { css, DefaultTheme } from 'styled-components'

import { fadeInSlowly } from '@/animations'
import AppHeader from '@/components/AppHeader'
import Button from '@/components/Button'
import NavItem from '@/components/NavItem'
import SideBar from '@/components/PageComponents/SideBar'
import Scrollbar from '@/components/Scrollbar'
import Spinner from '@/components/Spinner'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { ReactComponent as AlephiumLogoSVG } from '@/images/alephium_logo_monochrome.svg'
import ModalPortal from '@/modals/ModalPortal'
import NotificationsModal from '@/modals/NotificationsModal'
import { syncAddressesData } from '@/storage/addresses/addressesActions'
import { useInterval } from '@/utils/hooks'
import { getInitials, onEnterOrSpace } from '@/utils/misc'

interface UnlockedWalletLayoutProps {
  title?: string
  className?: string
  children?: ReactNode
}

dayjs.extend(relativeTime)

const walletNameAppearAfterSeconds = 1
const walletNameHideAfterSeconds = 4

const UnlockedWalletLayout = ({ children, title, className }: UnlockedWalletLayoutProps) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const networkStatus = useAppSelector((s) => s.network.status)
  const activeWalletName = useAppSelector((s) => s.activeWallet.name)
  const isLoadingData = useAppSelector((s) => s.addresses.syncingAddressData)
  const posthog = usePostHog()
  const previousWalletName = useRef<string>()

  const [fullWalletNameVisible, setFullWalletNameVisible] = useState(true)
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false)
  const [showAlephiumLogo, setShowAlephiumLogo] = useState(false)

  const openNotificationsModal = () => setIsNotificationsModalOpen(true)

  useInterval(() => {
    setShowAlephiumLogo(true)

    setTimeout(() => {
      setShowAlephiumLogo(false)
    }, 8000)
  }, 20000)

  useEffect(() => {
    if (activeWalletName !== previousWalletName.current) {
      setFullWalletNameVisible(true)
      previousWalletName.current = activeWalletName
    }

    const timeoutHandle = setTimeout(() => {
      if (fullWalletNameVisible) setFullWalletNameVisible(false)
    }, (walletNameHideAfterSeconds - walletNameAppearAfterSeconds) * 1000)

    return () => clearTimeout(timeoutHandle)
  }, [activeWalletName, fullWalletNameVisible])

  if (!activeWalletName) return null

  const activeWalletNameInitials = getInitials(activeWalletName)

  const refreshAddressesData = () => {
    dispatch(syncAddressesData())

    posthog.capture('Refreshed data')
  }

  return (
    <>
      <motion.div {...fadeInSlowly} className={className}>
        <SideBar>
          <AnimatePresence>
            {fullWalletNameVisible && (
              <OnEnterWalletName
                initial={{ x: 100, opacity: 0, scaleX: 1 }}
                animate={{ x: 130, opacity: 1, scaleX: 1 }}
                exit={{ x: -50, opacity: 0, scaleX: 0.5 }}
                transition={{
                  type: 'spring',
                  stiffness: 700,
                  damping: 70,
                  delay: walletNameAppearAfterSeconds
                }}
              >
                👋 {t('Wallet')}: {activeWalletName}
              </OnEnterWalletName>
            )}
          </AnimatePresence>
          <CurrentWalletInitials
            onClick={openNotificationsModal}
            onKeyDown={(e) => onEnterOrSpace(e, openNotificationsModal)}
            style={{ zIndex: isNotificationsModalOpen ? 2 : undefined }}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: walletNameHideAfterSeconds, type: 'spring', stiffness: 500, damping: 70 }}
            key={`initials-${activeWalletName}`}
            role="button"
            tabIndex={0}
          >
            <AnimatePresence mode="wait">
              <WalletInitialsContainer
                key={`initials-${showAlephiumLogo}`}
                initial={{ opacity: 0, y: -15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                transition={{ type: 'spring', stiffness: 500, damping: 70 }}
              >
                {showAlephiumLogo ? <AlephiumLogo /> : activeWalletNameInitials}
              </WalletInitialsContainer>
            </AnimatePresence>
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

export const UnlockedWalletPanel = styled.div<{
  top?: boolean
  bottom?: boolean
  doubleTop?: boolean
  backgroundColor?: keyof Pick<DefaultTheme['bg'], 'background1' | 'background2'>
}>`
  padding-left: 60px;
  padding-right: 60px;

  ${({ top, doubleTop }) =>
    css`
      padding-top: ${top ? 20 : doubleTop ? 40 : 0}px;
    `}

  ${({ bottom }) =>
    bottom &&
    css`
      padding-bottom: 60px;
    `}

  ${({ backgroundColor }) =>
    backgroundColor &&
    css`
      background-color: ${({ theme }) => theme.bg[backgroundColor]};
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
  min-height: 100vh;
  background-color: ${({ theme }) => theme.bg.background1};
  position: relative;
`

const SideNavigation = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 15px;
`

const RefreshButton = styled(Button)``

const CurrentWalletInitials = styled(motion.div)`
  width: 44px;
  height: 44px;
  border-radius: var(--radius-full);
  border: 1px solid ${({ theme }) => theme.border.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--fontWeight-semiBold);
  background-color: ${({ theme }) => theme.bg.primary};
  box-shadow: ${({ theme }) => theme.shadow.primary};
  overflow: hidden;

  &:hover {
    cursor: pointer;
    background-color: ${({ theme }) => theme.bg.hover};
  }
`

const OnEnterWalletName = styled(CurrentWalletInitials)`
  position: absolute;
  left: 20px;
  width: auto;
  border-radius: var(--radius-big);
  white-space: nowrap;
  padding: 20px;
  font-size: 15px;
  pointer-events: none;
  box-shadow: ${({ theme }) => theme.shadow.secondary};
  border: 2px solid ${({ theme }) => theme.global.accent};
`

const WalletInitialsContainer = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: center;
`

const AlephiumLogo = styled(AlephiumLogoSVG)`
  height: 25px;
  width: 25px;

  * {
    fill: ${({ theme }) => theme.font.primary} !important;
  }
`
