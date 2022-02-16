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
import { AnimatePresence, motion, useViewportScroll } from 'framer-motion'
import { Layers, List, Lock, RefreshCw, Send } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Route, Switch, useLocation } from 'react-router-dom'
import styled from 'styled-components'

import ActionButton from '../../components/ActionButton'
import Amount from '../../components/Amount'
import AppHeader from '../../components/AppHeader'
import Button from '../../components/Button'
import FloatingLogo from '../../components/FloatingLogo'
import ModalCentered from '../../components/ModalCentered'
import { FloatingPanel, MainContent, Section } from '../../components/PageComponents/PageContainers'
import Spinner from '../../components/Spinner'
import { useAddressesContext } from '../../contexts/addresses'
import { useGlobalContext } from '../../contexts/global'
import { appHeaderHeight, deviceBreakPoints } from '../../style/globalStyles'
import SettingsPage from '../Settings/SettingsPage'
import AddressesPage from '../Wallet/AddressesPage'
import AddressDetailsPage from './AddressDetailsPage'
import SendModal from './SendModal'

dayjs.extend(relativeTime)

const WalletHomePage = () => {
  const { wallet, lockWallet, currentUsername } = useGlobalContext()
  const [isHeaderCompact, setIsHeaderCompact] = useState(false)
  const location = useLocation()
  const [isSendModalOpen, setIsSendModalOpen] = useState(false)
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)
  const { addresses, refreshAddressesData, isLoadingData } = useAddressesContext()
  const totalBalance = addresses.reduce((acc, address) => acc + BigInt(address.details.balance), BigInt(0))
  const totalLockedBalance = addresses.reduce((acc, address) => acc + BigInt(address.details.lockedBalance), BigInt(0))
  const totalNumberOfTx = addresses.reduce((acc, address) => acc + address.transactions.confirmed.length, 0)

  // Animation related to scroll
  const { scrollY } = useViewportScroll()

  useEffect(() => {
    return scrollY.onChange((y) => {
      if (y >= 200 && !isHeaderCompact) {
        setIsHeaderCompact(true)
      } else if (y < 200 && isHeaderCompact) {
        setIsHeaderCompact(false)
      }
    })
  }, [isHeaderCompact, scrollY])

  const refreshData = () => {
    refreshAddressesData()
  }

  if (!wallet) return null

  return (
    <WalletContainer initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
      <AppHeader onSettingsClick={() => setIsSettingsModalOpen(true)}>
        <RefreshButton transparent squared onClick={refreshData} disabled={isLoadingData} aria-label="Refresh">
          {isLoadingData ? <Spinner /> : <RefreshCw />}
        </RefreshButton>
      </AppHeader>
      <WalletSidebar>
        <WalletAmountContainer>
          <WalletAmountHighlightOverlay />
          <WalletAmountContent>
            <WalletAmount value={totalBalance} />
            <WalletAmountSubtitle>Total balance</WalletAmountSubtitle>
            {totalLockedBalance > 0 && (
              <LockedBalance>
                <LockedBalanceIcon /> <Amount value={totalLockedBalance} />
              </LockedBalance>
            )}
            <CurrentAccount>Account: {currentUsername}</CurrentAccount>
          </WalletAmountContent>
        </WalletAmountContainer>
        <WalletActions>
          <ActionsTitle>Menu</ActionsTitle>
          <ActionButton Icon={Layers} label="Overview" link="/wallet/overview" />
          <ActionButton Icon={List} label="Addresses" link="/wallet/addresses" />
          <ActionButton Icon={Send} label="Send" onClick={() => setIsSendModalOpen(true)} />

          <ActionButton Icon={Lock} label="Lock" onClick={lockWallet} />
        </WalletActions>
        <FloatingLogo position="bottom" />
      </WalletSidebar>
      <AnimatePresence>
        {isHeaderCompact && (
          <CompactWalletAmountBoxContainer initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <CompactWalletAmountBox>
              <WalletAmountContainer style={{ scale: 0.7 }}>
                <WalletAmount value={totalBalance} />
              </WalletAmountContainer>
            </CompactWalletAmountBox>
          </CompactWalletAmountBoxContainer>
        )}
      </AnimatePresence>
      <Switch location={location} key={location.pathname}>
        <Route path="/wallet/overview" key="overview">
          <MainContent>
            <FloatingPanel>
              <LastTransactionListHeader>
                <LastTransactionListTitle>Transactions ({totalNumberOfTx})</LastTransactionListTitle>
                {isLoadingData && <Spinner size={'16px'} />}
              </LastTransactionListHeader>
            </FloatingPanel>
          </MainContent>
        </Route>
        <Route path="/wallet/addresses/:addressHash" key="address-details">
          <AddressDetailsPage />
        </Route>
        <Route path="/wallet/addresses" key="addresses">
          <AddressesPage />
        </Route>
      </Switch>
      <AnimatePresence exitBeforeEnter initial={true}>
        {isSendModalOpen && <SendModal title="Send" onClose={() => setIsSendModalOpen(false)} />}
        {isSettingsModalOpen && (
          <ModalCentered title="Settings" onClose={() => setIsSettingsModalOpen(false)}>
            <SettingsPage />
          </ModalCentered>
        )}
      </AnimatePresence>
    </WalletContainer>
  )
}

const walletSidebarWidth = 400

const WalletContainer = styled(motion.div)`
  display: flex;
  flex: 1;

  @media ${deviceBreakPoints.mobile} {
    flex-direction: column;
    overflow: initial;
  }
`

const WalletSidebar = styled(Section)`
  position: fixed;
  top: 0;
  bottom: 0;
  align-items: stretch;
  justify-content: flex-start;
  flex: 1;
  max-width: ${walletSidebarWidth}px;
  border-right: 1px solid ${({ theme }) => theme.border.primary};
  background-color: ${({ theme }) => theme.bg.primary};
  padding-top: ${appHeaderHeight};
  z-index: 1000;

  @media ${deviceBreakPoints.mobile} {
    position: relative;
    flex: 0;
    max-width: inherit;
    border: none;
    z-index: 0;
  }
`

const CompactWalletAmountBoxContainer = styled(motion.div)`
  align-items: flex-start;
  justify-content: flex-start;
  margin: var(--spacing-1) !important;
  margin-top: calc(${appHeaderHeight} + var(--spacing-1)) !important;
  flex: 0;
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  z-index: 1000;
  display: none;

  @media ${deviceBreakPoints.mobile} {
    display: block;
  }
`

const WalletAmountContent = styled.div`
  position: relative;
  height: 100%;
  padding: var(--spacing-5);
  display: flex;
  flex-direction: column;
  justify-content: center;
  z-index: 1;
`

const WalletAmountHighlightOverlay = styled.div`
  background: ${({ theme }) => theme.global.highlightGradient};
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  z-index: 0;

  opacity: 0.7;

  transition: all 0.15s ease-out;
`

const WalletAmountContainer = styled.div`
  position: relative;
  min-height: 150px;
  margin: var(--spacing-5);
  margin-top: var(--spacing-2);
  border-radius: var(--radius);
  background-color: ${({ theme }) => theme.bg.contrast};
  overflow: hidden;

  &:hover {
    ${WalletAmountHighlightOverlay} {
      opacity: 0.9;
    }
  }
`

const CompactWalletAmountBox = styled(motion.div)`
  background: ${({ theme }) => theme.global.highlightGradient};
  width: 100%;
  height: 60px;
  padding: 0 var(--spacing-5);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius);
  box-shadow: 0 10px 10px var(--color-shadow-10);

  ${WalletAmountContainer} {
    margin: 0;
    background: transparent;

    @media ${deviceBreakPoints.mobile} {
      min-height: initial;
    }
  }
`

const WalletAmount = styled(Amount)`
  font-size: 2.5rem;
  color: ${({ theme }) => theme.font.contrastPrimary};
  text-align: center;
  font-weight: var(--fontWeight-semiBold);
`

const WalletAmountSubtitle = styled.div`
  margin: 0 auto;
  font-size: 1rem;
  color: ${({ theme }) => theme.font.contrastSecondary};
  text-align: center;
  font-weight: var(--fontWeight-medium);
`

const CurrentAccount = styled.span`
  text-align: center;
  color: ${({ theme }) => theme.font.contrastSecondary};
  margin-top: var(--spacing-2);
  font-size: 0.95em;
`

const WalletActions = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 0 var(--spacing-5);
  border-top: 1px solid ${({ theme }) => theme.border.secondary};

  @media ${deviceBreakPoints.mobile} {
    border-bottom: 1px solid ${({ theme }) => theme.border.secondary};
  }
`

const ActionsTitle = styled.h3`
  width: 100%;
  color: ${({ theme }) => theme.font.secondary};
`

const RefreshButton = styled(Button)``

// === TRANSACTION === //

const LastTransactionListHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: var(--spacing-3);
`

const LastTransactionListTitle = styled.h2`
  margin: 0 var(--spacing-3) 0 0;

  @media ${deviceBreakPoints.mobile} {
    margin-left: 0;
  }
`

const LockedBalance = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.font.contrastSecondary};
  margin-top: var(--spacing-2);
  font-weight: var(--fontWeight-medium);
  font-size: 1rem;
`

const LockedBalanceIcon = styled(Lock)`
  height: 1rem;
`

export default WalletHomePage
