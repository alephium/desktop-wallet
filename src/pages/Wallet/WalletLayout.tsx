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
import { FileCode, Layers, List, Lock, RefreshCw, Send, TerminalSquare } from 'lucide-react'
import React, { FC, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'
import styled, { useTheme } from 'styled-components'

import ActionButton from '../../components/ActionButton'
import AppHeader from '../../components/AppHeader'
import Button from '../../components/Button'
import InfoBox from '../../components/InfoBox'
import Select from '../../components/Inputs/Select'
import WalletPassphrase from '../../components/Inputs/WalletPassphrase'
import PasswordConfirmation from '../../components/PasswordConfirmation'
import Spinner from '../../components/Spinner'
import { useAddressesContext } from '../../contexts/addresses'
import { useGlobalContext } from '../../contexts/global'
import LogoDarkSrc from '../../images/alephium_logo_dark.svg'
import LogoLightSrc from '../../images/alephium_logo_light.svg'
import CenteredModal from '../../modals/CenteredModal'
import { TxModal } from '../../modals/SendModal/TxModal'
import { appHeaderHeightPx, deviceBreakPoints, walletSidebarWidthPx } from '../../style/globalStyles'

interface WalletNameSelectOptions {
  label: string
  value: string
}

dayjs.extend(relativeTime)

const WalletLayout: FC = ({ children }) => {
  const { t } = useTranslation('App')
  const {
    wallet,
    walletNames,
    lockWallet,
    activeWalletName,
    unlockWallet,
    networkStatus,
    txModalType,
    setTxModalType
  } = useGlobalContext()
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [passphrase, setPassphrase] = useState('')
  const [isPassphraseConfirmed, setIsPassphraseConfirmed] = useState(false)
  const { refreshAddressesData, isLoadingData } = useAddressesContext()
  const navigate = useNavigate()
  const location = useLocation()
  const theme = useTheme()
  const [switchToWalletName, setSwitchToWalletName] = useState(activeWalletName)
  const walletNameSelectOptions = walletNames.map((walletName) => ({
    label: walletName,
    value: walletName
  }))

  const handleWalletNameChange = (option: WalletNameSelectOptions | undefined) => {
    if (option) {
      setSwitchToWalletName(option.value)
      setIsPasswordModalOpen(true)
    }
  }

  const onLoginClick = (password: string) => {
    setIsPasswordModalOpen(false)
    unlockWallet(
      switchToWalletName,
      password,
      () => {
        const nextPageLocation = '/wallet/overview'
        if (location.pathname !== nextPageLocation) navigate(nextPageLocation)
      },
      passphrase
    )
    if (passphrase) setPassphrase('')
  }

  const onPasswordModalClose = () => {
    setSwitchToWalletName('')
    setIsPasswordModalOpen(false)
  }

  if (!wallet) return null

  return (
    <WalletContainer initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
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
      <WalletSidebar>
        <LogoContainer>
          <Logo src={theme.name === 'light' ? LogoDarkSrc : LogoLightSrc} alt={t`Alephium Logo`} />
          <Texts>
            <AlephiumText>{t`Alephium`}</AlephiumText>
            <WalletText>{t`Wallet`}</WalletText>
          </Texts>
        </LogoContainer>
        {walletNameSelectOptions.length === 0 ? (
          <InfoBox text={activeWalletName} label={t`WALLET`} />
        ) : (
          <Select
            label={t`CURRENT WALLET`}
            options={walletNameSelectOptions}
            controlledValue={{
              label: activeWalletName,
              value: activeWalletName
            }}
            onValueChange={handleWalletNameChange}
            title={t`Select a wallet`}
            id="wallet"
            raised
            skipEqualityCheck
          />
        )}
        <WalletActions>
          <ActionsTitle>{t`MENU`}</ActionsTitle>
          <ActionButton Icon={Layers} label={t`Overview`} link="/wallet/overview" />
          <ActionButton Icon={List} label={t`Addresses`} link="/wallet/addresses" />
          <ActionButton Icon={Send} label={t`Send`} onClick={() => setTxModalType('transfer')} />
          <ActionButton Icon={TerminalSquare} label="Call Contract" onClick={() => setTxModalType('script')} />
          <ActionButton Icon={FileCode} label="Deploy Contract" onClick={() => setTxModalType('deploy-contract')} />
          <ActionButton Icon={Lock} label={t`Lock`} onClick={lockWallet} />
        </WalletActions>
      </WalletSidebar>
      <AnimatePresence exitBeforeEnter initial={true}>
        {txModalType && <TxModal txModalType={txModalType} onClose={() => setTxModalType(false)} />}
        {isPasswordModalOpen && (
          <CenteredModal narrow title={t`Enter password`} onClose={onPasswordModalClose}>
            <PasswordConfirmation
              text={t('Enter password for "{{ switchToWalletName }}"', { switchToWalletName })}
              buttonText={t`Login`}
              onCorrectPasswordEntered={onLoginClick}
              walletName={switchToWalletName}
              isSubmitDisabled={!isPassphraseConfirmed}
            >
              <WalletPassphraseStyled
                onPassphraseConfirmed={setPassphrase}
                setIsPassphraseConfirmed={setIsPassphraseConfirmed}
              />
            </PasswordConfirmation>
          </CenteredModal>
        )}
      </AnimatePresence>
      {children}
    </WalletContainer>
  )
}

export default WalletLayout

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
  margin-bottom: 50px;
  margin-left: var(--spacing-2);
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

const WalletSidebar = styled.div`
  position: fixed;
  top: 0;
  bottom: 0;
  align-items: stretch;
  justify-content: flex-start;
  flex: 1;
  width: ${walletSidebarWidthPx}px;
  border-right: 1px solid ${({ theme }) => theme.border.secondary};
  background-color: ${({ theme }) => theme.bg.tertiary};
  padding: ${appHeaderHeightPx}px var(--spacing-4) 0;
  z-index: 1000;

  @media ${deviceBreakPoints.mobile} {
    position: relative;
    flex: 0;
    max-width: inherit;
    border: none;
    z-index: 0;
  }
`

const WalletActions = styled.nav`
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

const WalletPassphraseStyled = styled(WalletPassphrase)`
  margin: 16px 0;
  width: 100%;
`
