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

import { getStorage } from 'alephium-js'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { AnimatePresence, motion } from 'framer-motion'
import { Layers, List, Lock, RefreshCw, Send } from 'lucide-react'
import { FC, useState } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import styled from 'styled-components'

import ActionButton from '../../components/ActionButton'
import AppHeader from '../../components/AppHeader'
import Button from '../../components/Button'
import Select from '../../components/Inputs/Select'
import ModalCentered from '../../components/ModalCentered'
import { Section } from '../../components/PageComponents/PageContainers'
import PasswordConfirmation from '../../components/PasswordConfirmation'
import Spinner from '../../components/Spinner'
import { useAddressesContext } from '../../contexts/addresses'
import { useGlobalContext } from '../../contexts/global'
import LogoSrc from '../../images/alephium_logo.svg'
import SendModal from '../../modals/SendModal'
import { appHeaderHeight, deviceBreakPoints, walletSidebarWidth } from '../../style/globalStyles'

interface UsernameSelectOptions {
  label: string
  value: string
}

dayjs.extend(relativeTime)

const Storage = getStorage()

const WalletLayout: FC = ({ children }) => {
  const { wallet, lockWallet, currentUsername, login } = useGlobalContext()
  const [isSendModalOpen, setIsSendModalOpen] = useState(false)
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const { refreshAddressesData, isLoadingData } = useAddressesContext()
  const history = useHistory()
  const location = useLocation()
  const usernames = Storage.list()
  const [switchToUsername, setSwitchToUsername] = useState(currentUsername)
  const usernameSelectOptions = usernames
    .filter((username) => username !== currentUsername)
    .map((username) => ({
      label: username,
      value: username
    }))

  const refreshData = () => {
    refreshAddressesData()
  }

  const handleUsernameChange = (option: UsernameSelectOptions | undefined) => {
    if (option && option.value !== switchToUsername && option.value !== currentUsername) {
      setSwitchToUsername(option.value)
      setIsPasswordModalOpen(true)
    }
  }

  const onLoginClick = (password: string) => {
    setIsPasswordModalOpen(false)
    login(switchToUsername, password, () => {
      const nextPageLocation = '/wallet/overview'
      if (location.pathname !== nextPageLocation) history.push(nextPageLocation)
    })
  }

  if (!wallet) return null

  return (
    <WalletContainer initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
      <AppHeader>
        <RefreshButton transparent squared onClick={refreshData} disabled={isLoadingData} aria-label="Refresh">
          {isLoadingData ? <Spinner /> : <RefreshCw />}
        </RefreshButton>
      </AppHeader>
      <WalletSidebar>
        <LogoContainer>
          <Logo src={LogoSrc} alt="Alephium Logo" />
          <Texts>
            <AlephiumText>Alephium</AlephiumText>
            <WalletText>Wallet</WalletText>
          </Texts>
        </LogoContainer>
        <Select
          placeholder="ACCOUNT"
          options={usernameSelectOptions}
          controlledValue={{
            label: currentUsername,
            value: currentUsername
          }}
          onValueChange={handleUsernameChange}
          title="Select an account"
          id="account"
        />
        <WalletActions>
          <ActionsTitle>Menu</ActionsTitle>
          <ActionButton Icon={Layers} label="Overview" link="/wallet/overview" />
          <ActionButton Icon={List} label="Addresses" link="/wallet/addresses" />
          <ActionButton Icon={Send} label="Send" onClick={() => setIsSendModalOpen(true)} />
          <ActionButton Icon={Lock} label="Lock" onClick={lockWallet} />
        </WalletActions>
      </WalletSidebar>
      <AnimatePresence exitBeforeEnter initial={true}>
        {isSendModalOpen && <SendModal onClose={() => setIsSendModalOpen(false)} />}
        {isPasswordModalOpen && (
          <ModalCentered title="Enter password" onClose={() => setIsPasswordModalOpen(false)}>
            <PasswordConfirmation
              text={`Enter password for "${switchToUsername}"`}
              buttonText="Login"
              onCorrectPasswordEntered={onLoginClick}
              username={switchToUsername}
            />
          </ModalCentered>
        )}
      </AnimatePresence>
      {children}
    </WalletContainer>
  )
}

const WalletContainer = styled(motion.div)`
  display: flex;
  flex: 1;

  @media ${deviceBreakPoints.mobile} {
    flex-direction: column;
    overflow: initial;
  }
`

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 30px;
  margin-bottom: 45px;
`

const Logo = styled.img`
  width: 30px;
`

const Texts = styled.div``

const AlephiumText = styled.div`
  font-weight: var(--fontWeight-semiBold);
  font-size: 20px;
  margin-bottom: 3px;
`

const WalletText = styled.div`
  font-weight: var(--fontWeight-semiBold);
  font-size: 16px;
  color: ${({ theme }) => theme.font.secondary};
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
  padding: ${appHeaderHeight} var(--spacing-5) 0;
  z-index: 1000;

  @media ${deviceBreakPoints.mobile} {
    position: relative;
    flex: 0;
    max-width: inherit;
    border: none;
    z-index: 0;
  }
`

const WalletActions = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  margin-top: 35px;

  @media ${deviceBreakPoints.mobile} {
    border-bottom: 1px solid ${({ theme }) => theme.border.secondary};
  }
`

const ActionsTitle = styled.h3`
  width: 100%;
  color: ${({ theme }) => theme.font.secondary};
  margin-top: 0;
`

const RefreshButton = styled(Button)``

export default WalletLayout
