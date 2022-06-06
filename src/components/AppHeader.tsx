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

import { AnimatePresence, motion, useTransform, useViewportScroll } from 'framer-motion'
import { Eye, EyeOff, Settings as SettingsIcon, WifiOff } from 'lucide-react'
import { FC, useEffect, useState } from 'react'
import ReactTooltip from 'react-tooltip'
import styled, { useTheme } from 'styled-components'
import tinycolor from 'tinycolor2'

import { useAddressesContext } from '../contexts/addresses'
import { useGlobalContext } from '../contexts/global'
import walletConnectIcon from '../images/wallet-connect-logo.svg'
import SettingsModal from '../modals/SettingsModal'
import WalletConnectModal from '../modals/WalletConnectModal'
import { deviceBreakPoints } from '../style/globalStyles'
import AddressBadge from './AddressBadge'
import Button from './Button'
import CompactToggle from './Inputs/CompactToggle'
import NetworkBadge from './NetworkBadge'
import ThemeSwitcher from './ThemeSwitcher'
import Tooltip from './Tooltip'

const AppHeader: FC = ({ children }) => {
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)
  const [isWalletConnectModalOpen, setIsWalletConnectModalOpen] = useState(false)
  const { scrollY } = useViewportScroll()
  const theme = useTheme()
  const { mainAddress } = useAddressesContext()
  const { networkStatus } = useGlobalContext()
  const isOffline = networkStatus === 'offline'

  const headerBGColor = useTransform(
    scrollY,
    [0, 100],
    [tinycolor(theme.bg.primary).setAlpha(0).toString(), theme.bg.primary]
  )
  const {
    settings: {
      general: { discreetMode }
    },
    updateSettings
  } = useGlobalContext()

  useEffect(() => {
    if (isOffline || mainAddress) ReactTooltip.rebuild()
  }, [isOffline, mainAddress])

  return (
    <>
      <HeaderContainer id="app-header" style={{ backgroundColor: headerBGColor }}>
        <ThemeSwitcher />
        <HeaderDivider />
        {isOffline && (
          <>
            <div data-tip="The wallet is offline.">
              <OfflineIcon size={20} />
            </div>
            <HeaderDivider />
          </>
        )}
        {children && (
          <>
            {children}
            <HeaderDivider />
          </>
        )}
        <CompactToggle
          toggled={discreetMode}
          onToggle={() => updateSettings('general', { discreetMode: !discreetMode })}
          IconOn={EyeOff}
          IconOff={Eye}
          data-tip="Discreet mode"
        />
        {mainAddress && (
          <>
            <HeaderDivider />
            <AddressBadge
              color={mainAddress?.settings.color}
              addressName={mainAddress?.getLabelName()}
              data-tip="Main address"
              opaqueBg
            />
          </>
        )}
        <HeaderDivider />
        <NetworkBadge />
        <HeaderDivider />
        {mainAddress && (
          <>
            <Button
              transparent
              squared
              onClick={() => setIsWalletConnectModalOpen(true)}
              aria-label="WalletConnect"
              data-tip="Connect wallet to dApp"
            >
              <img src={walletConnectIcon} style={{ width: '100%' }} />
            </Button>
            <HeaderDivider />
          </>
        )}
        <Button
          transparent
          squared
          onClick={() => setIsSettingsModalOpen(true)}
          aria-label="Settings"
          data-tip="Settings"
        >
          <SettingsIcon />
        </Button>
      </HeaderContainer>
      <AnimatePresence>
        {isSettingsModalOpen && <SettingsModal onClose={() => setIsSettingsModalOpen(false)} />}
      </AnimatePresence>
      <AnimatePresence>
        {isWalletConnectModalOpen && <WalletConnectModal onClose={() => setIsWalletConnectModalOpen(false)} />}
      </AnimatePresence>
      <Tooltip />
    </>
  )
}

export const HeaderDivider = styled.div`
  width: 1px;
  height: var(--spacing-2);
  background-color: ${({ theme }) => (theme.name === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.15)')};
`

const HeaderContainer = styled(motion.header)`
  height: 50px;
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  z-index: 900;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 0 var(--spacing-4);
  gap: var(--spacing-1);

  > *:not(:last-child) {
    margin-right: var(--spacing-1);
  }

  @media ${deviceBreakPoints.mobile} {
    background-color: ${({ theme }) => theme.bg.primary};
  }
`

const OfflineIcon = styled(WifiOff)`
  color: ${({ theme }) => theme.font.secondary};
  margin: 0 10px;
`

export default AppHeader
