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

import { colord } from 'colord'
import { motion, useMotionValue, useTransform } from 'framer-motion'
import { Eye, EyeOff, WifiOff } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TooltipWrapper } from 'react-tooltip'
import styled, { useTheme } from 'styled-components'

import { useAddressesContext } from '@/contexts/addresses'
import { useGlobalContext } from '@/contexts/global'
import { useScrollContext } from '@/contexts/scroll'
import { useWalletConnectContext } from '@/contexts/walletconnect'
import { useAppSelector } from '@/hooks/redux'
import walletConnectIcon from '@/images/wallet-connect-logo.svg'
import ModalPortal from '@/modals/ModalPortal'
import WalletConnectModal from '@/modals/WalletConnectModal'
import { appHeaderHeightPx, walletSidebarWidthPx } from '@/style/globalStyles'

import AddressBadge from './AddressBadge'
import Button from './Button'
import CompactToggle from './Inputs/CompactToggle'
import NetworkBadge from './NetworkBadge'
import ThemeSwitcher from './ThemeSwitcher'

interface AppHeader {
  className?: string
}

// This shall be removed once v2.0.0 is released
const hideWalletConnectButton = false

const AppHeader: FC<AppHeader> = ({ children, className }) => {
  const { t } = useTranslation()
  const { scroll } = useScrollContext()
  const scrollY = useMotionValue(0)
  const theme = useTheme()
  const { mnemonic, isPassphraseUsed } = useAppSelector((state) => state.activeWallet)
  const { deepLinkUri } = useWalletConnectContext()
  const { mainAddress } = useAddressesContext()
  const {
    networkStatus,
    settings: {
      general: { discreetMode }
    },
    updateSettings
  } = useGlobalContext()

  const [isWalletConnectModalOpen, setIsWalletConnectModalOpen] = useState(false)

  const isAuthenticated = !!mnemonic

  scrollY.set(scroll?.scrollTop ?? 0)

  const headerBGColor = useTransform(
    scrollY,
    [0, 100],
    [colord(theme.bg.primary).alpha(0).toRgbString(), theme.bg.primary]
  )

  useEffect(() => {
    if (deepLinkUri && isAuthenticated) setIsWalletConnectModalOpen(true)
  }, [isAuthenticated, deepLinkUri])

  const offlineText = t`The wallet is offline.`

  return (
    <>
      <motion.header id="app-header" style={{ backgroundColor: headerBGColor }} className={className}>
        <ThemeSwitcher />
        <HeaderDivider />
        {networkStatus === 'offline' && (
          <>
            <TooltipWrapper content={offlineText}>
              <OfflineIcon tabIndex={0} aria-label={offlineText}>
                <WifiOff
                  size={20}
                  color={theme.name === 'dark' ? theme.font.secondary : theme.font.contrastSecondary}
                />
              </OfflineIcon>
            </TooltipWrapper>
            <HeaderDivider />
          </>
        )}
        {children && (
          <>
            {children}
            <HeaderDivider />
          </>
        )}
        <TooltipWrapper content={t`Discreet mode`}>
          <CompactToggle
            toggled={discreetMode}
            onToggle={() => updateSettings('general', { discreetMode: !discreetMode })}
            IconOn={EyeOff}
            IconOff={Eye}
          />
        </TooltipWrapper>
        {mainAddress && !isPassphraseUsed && (
          <>
            <HeaderDivider />
            <TooltipWrapper content={t`Default address`}>
              <AddressBadge address={mainAddress} />
            </TooltipWrapper>
          </>
        )}
        <HeaderDivider />
        <NetworkBadge />
        {isAuthenticated && !hideWalletConnectButton && (
          <>
            <HeaderDivider />
            <TooltipWrapper content={t`Connect wallet to dApp`}>
              <Button
                transparent
                squared
                role="secondary"
                onClick={() => setIsWalletConnectModalOpen(true)}
                aria-label="WalletConnect"
              >
                <img src={walletConnectIcon} style={{ width: '100%' }} />
              </Button>
            </TooltipWrapper>
          </>
        )}
      </motion.header>
      <ModalPortal>
        {isWalletConnectModalOpen && (
          <WalletConnectModal uri={deepLinkUri} onClose={() => setIsWalletConnectModalOpen(false)} />
        )}
      </ModalPortal>
    </>
  )
}

export default styled(AppHeader)`
  position: fixed;
  top: 0;
  right: 0;
  left: ${walletSidebarWidthPx}px;

  display: flex;
  justify-content: flex-end;
  align-items: center;

  height: ${appHeaderHeightPx}px;
  padding: 0 var(--spacing-4);
  gap: var(--spacing-1);

  > *:not(:last-child) {
    margin-right: var(--spacing-1);
  }
`

const HeaderDivider = styled.div`
  width: 1px;
  height: var(--spacing-2);
  background-color: ${({ theme }) => (theme.name === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.15)')};
`

const OfflineIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 40px;
  background-color: ${({ theme }) => theme.global.alert};
`
