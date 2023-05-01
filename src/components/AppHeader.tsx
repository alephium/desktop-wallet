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

import { colord } from 'colord'
import { motion, useMotionValue, useTransform } from 'framer-motion'
import { Eye, EyeOff, WifiOff } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { useTheme } from 'styled-components'

import Button from '@/components/Button'
import DefaultAddressSwitch from '@/components/DefaultAddressSwitch'
import CompactToggle from '@/components/Inputs/CompactToggle'
import NetworkSwitch from '@/components/NetworkSwitch'
import VerticalDivider from '@/components/PageComponents/VerticalDivider'
import { useScrollContext } from '@/contexts/scroll'
import { useWalletConnectContext } from '@/contexts/walletconnect'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { ReactComponent as WalletConnectLogo } from '@/images/wallet-connect-logo.svg'
import ModalPortal from '@/modals/ModalPortal'
import WalletConnectModal from '@/modals/WalletConnectModal'
import { selectAllAddresses, selectDefaultAddress } from '@/storage/addresses/addressesSelectors'
import { discreetModeToggled } from '@/storage/settings/settingsActions'
import { appHeaderHeightPx, walletSidebarWidthPx } from '@/style/globalStyles'

interface AppHeader {
  title?: string
  invisible?: boolean
  className?: string
}

const AppHeader: FC<AppHeader> = ({ children, title, className, invisible }) => {
  const { t } = useTranslation()
  const { scrollY: scrollYContext } = useScrollContext()
  const initialScroll = useMotionValue(0)
  const scrollY = scrollYContext || initialScroll
  const theme = useTheme()
  const dispatch = useAppDispatch()
  const defaultAddress = useAppSelector(selectDefaultAddress)
  const mnemonic = useAppSelector((s) => s.activeWallet.mnemonic)
  const isPassphraseUsed = useAppSelector((s) => s.activeWallet.passphrase)
  const discreetMode = useAppSelector((s) => s.settings.discreetMode)
  const networkStatus = useAppSelector((s) => s.network.status)
  const addresses = useAppSelector(selectAllAddresses)
  const { proposalEvent, wcSessionState } = useWalletConnectContext()

  const [isWalletConnectModalOpen, setIsWalletConnectModalOpen] = useState(false)

  const isAuthenticated = !!mnemonic
  const offlineText = t('The wallet is offline.')

  const toggleDiscreetMode = () => dispatch(discreetModeToggled())

  useEffect(() => {
    if (proposalEvent?.id && isAuthenticated) {
      console.log('opening wallet connect modal...')
      setIsWalletConnectModalOpen(true)
    }
  }, [isAuthenticated, proposalEvent?.id])

  const headerStyles = {
    backgroundColor: useTransform(
      scrollY,
      [0, 100],
      [colord(theme.bg.background1).alpha(0).toHex(), colord(theme.bg.tertiary).alpha(0.9).toHex()]
    )
  }

  const titleStyles = {
    opacity: useTransform(scrollY, [0, 100, 100], [0, 0, 1]),
    transition: 'opacity 0.2s ease-out'
  }

  if (invisible) return <motion.header id="app-header" className={className} />

  return (
    <>
      <motion.header id="app-header" style={headerStyles} className={className}>
        <Title style={titleStyles}>{title}</Title>
        <HeaderButtons>
          {networkStatus === 'offline' && (
            <>
              <OfflineIcon
                tabIndex={0}
                aria-label={offlineText}
                data-tooltip-content={offlineText}
                data-tooltip-id="default"
              >
                <WifiOff size={20} color={theme.global.alert} />
              </OfflineIcon>

              <VerticalDivider />
            </>
          )}

          {children && (
            <>
              {children}
              <VerticalDivider />
            </>
          )}

          <CompactToggle
            toggled={discreetMode}
            onToggle={toggleDiscreetMode}
            IconOn={EyeOff}
            IconOff={Eye}
            data-tooltip-id="default"
            data-tooltip-content={t('Discreet mode')}
            short
          />
          <VerticalDivider />

          {isAuthenticated && (
            <>
              <Button
                transparent
                squared
                short
                role="secondary"
                onClick={() => setIsWalletConnectModalOpen(true)}
                aria-label="WalletConnect"
                isHighlighted={wcSessionState === 'initialized'}
                data-tooltip-id="default"
                data-tooltip-content={t('Connect wallet to dApp')}
              >
                <WalletConnectLogoStyled />
              </Button>
              <VerticalDivider />
            </>
          )}

          {defaultAddress && !isPassphraseUsed && (
            <>
              <DefaultAddressSwitch />
              <VerticalDivider />
            </>
          )}

          <NetworkSwitch />
        </HeaderButtons>
      </motion.header>
      <ModalPortal>
        {isWalletConnectModalOpen && addresses.length > 0 && (
          <WalletConnectModal onClose={() => setIsWalletConnectModalOpen(false)} />
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
  justify-content: space-between;
  align-items: center;

  height: ${appHeaderHeightPx}px;
  padding: 0 var(--spacing-4) 0 60px;
  gap: var(--spacing-1);

  backdrop-filter: ${({ invisible }) => (!invisible ? 'blur(10px)' : 'none')};
  z-index: 1;
`

const OfflineIcon = styled.div`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 35px;
  height: 35px;
  border-radius: 35px;
  background-color: ${({ theme }) => colord(theme.global.alert).alpha(0.2).toHex()};
`

const Title = styled(motion.div)`
  font-size: 16px;
  font-weight: var(--fontWeight-semiBold);
  color: ${({ theme }) => theme.font.primary};
`

const HeaderButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: var(--spacing-1);

  > *:not(:last-child) {
    margin-right: var(--spacing-1);
  }
`

const WalletConnectLogoStyled = styled(WalletConnectLogo)`
  height: auto;
`
