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

import { motion } from 'framer-motion'
import React, { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import styled from 'styled-components'
import tinycolor from 'tinycolor2'

import AppHeader from '../components/AppHeader'
import Button from '../components/Button'
import SideBar from '../components/HomePage/SideBar'
import Input from '../components/Inputs/Input'
import Select from '../components/Inputs/Select'
import WalletPassphrase from '../components/Inputs/WalletPassphrase'
import { FloatingPanel, Section } from '../components/PageComponents/PageContainers'
import PanelTitle from '../components/PageComponents/PanelTitle'
import Paragraph from '../components/Paragraph'
import { useGlobalContext } from '../contexts/global'
import UpdateWalletModal from '../modals/UpdateWalletModal'
import { deviceBreakPoints } from '../style/globalStyles'

interface HomeProps {
  hasWallet: boolean
  walletNames: string[]
}

const HomePage = ({ hasWallet, walletNames }: HomeProps) => {
  const [showInitialActions, setShowInitialActions] = useState(false)
  const { newLatestVersion } = useGlobalContext()
  const [isUpdateWalletModalVisible, setUpdateWalletModalVisible] = useState(!!newLatestVersion)
  const { t } = useTranslation('App')

  const hideInitialActions = () => setShowInitialActions(false)
  const displayInitialActions = () => setShowInitialActions(true)

  useEffect(() => {
    if (newLatestVersion) setUpdateWalletModalVisible(true)
  }, [newLatestVersion])

  return (
    <HomeContainer initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
      <AppHeader />
      <SideBar />
      <InteractionArea>
        <FloatingPanel verticalAlign="center" horizontalAlign="center">
          {!showInitialActions && !hasWallet && (
            <>
              <PanelTitle useLayoutId={false}>{t`Welcome!`}</PanelTitle>
              <InitialActions />
            </>
          )}
          {!showInitialActions && hasWallet && (
            <>
              <PanelTitle useLayoutId={false} isSticky={false}>{t`Welcome back!`}</PanelTitle>
              <Paragraph centered secondary>
                {t`Please choose a wallet and enter your password to continue.`}
              </Paragraph>
              <Login onLinkClick={displayInitialActions} walletNames={walletNames} />
            </>
          )}
          {showInitialActions && (
            <>
              <PanelTitle useLayoutId={false}>{t`New wallet`}</PanelTitle>
              <InitialActions showLinkToExistingWallets onLinkClick={hideInitialActions} />
            </>
          )}
        </FloatingPanel>
      </InteractionArea>
      {isUpdateWalletModalVisible && (
        <UpdateWalletModal newVersion={newLatestVersion} onClose={() => setUpdateWalletModalVisible(false)} />
      )}
    </HomeContainer>
  )
}

// === Components

interface LoginProps {
  walletNames: string[]
  onLinkClick: () => void
}

const Login = ({ walletNames, onLinkClick }: LoginProps) => {
  const { t } = useTranslation('App')
  const [credentials, setCredentials] = useState({ walletName: '', password: '' })
  const { login } = useGlobalContext()
  const navigate = useNavigate()
  const [passphrase, setPassphrase] = useState('')
  const [isPassphraseConfirmed, setIsPassphraseConfirmed] = useState(false)

  const handleCredentialsChange = useCallback((type: 'walletName' | 'password', value: string) => {
    setCredentials((prev) => ({ ...prev, [type]: value }))
  }, [])

  const handleLogin = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault()
    login(credentials.walletName, credentials.password, () => navigate('/wallet/overview'), passphrase)

    if (passphrase) setPassphrase('')
  }

  return (
    <>
      <SectionStyled inList>
        <Select
          label={t`Wallet`}
          options={walletNames.map((u) => ({ label: u, value: u }))}
          onValueChange={(value) => handleCredentialsChange('walletName', value?.value || '')}
          title={t`Select a wallet`}
          id="wallet"
        />
        <Input
          label={t`Password`}
          type="password"
          autoComplete="off"
          onChange={(e) => handleCredentialsChange('password', e.target.value)}
          value={credentials.password}
          id="password"
        />
        <WalletPassphrase onPassphraseConfirmed={setPassphrase} setIsPassphraseConfirmed={setIsPassphraseConfirmed} />
      </SectionStyled>
      <SectionStyled>
        <Button
          onClick={handleLogin}
          submit
          disabled={!credentials.walletName || !credentials.password || !isPassphraseConfirmed}
        >
          {t`Login`}
        </Button>
      </SectionStyled>
      <SwitchLink onClick={onLinkClick} centered>
        {t`Create / import a new wallet`}
      </SwitchLink>
    </>
  )
}

const InitialActions = ({
  showLinkToExistingWallets,
  onLinkClick
}: {
  showLinkToExistingWallets?: boolean
  onLinkClick?: () => void
}) => {
  const navigate = useNavigate()
  const { t } = useTranslation('App')

  return (
    <>
      <Paragraph centered secondary>
        {t`Please choose whether you want to create a new wallet or import an existing one.`}
      </Paragraph>
      <Section inList>
        <Button onClick={() => navigate('/create/0')}>{t`New wallet`}</Button>
        <Button onClick={() => navigate('/import/0')}>{t`Import wallet`}</Button>
        {showLinkToExistingWallets && (
          <SwitchLink onClick={onLinkClick} centered>
            {t`Use an existing wallet`}
          </SwitchLink>
        )}
      </Section>
    </>
  )
}

const HomeContainer = styled(motion.main)`
  display: flex;
  flex: 1;

  @media ${deviceBreakPoints.mobile} {
    flex-direction: column;
  }
`

const InteractionArea = styled.div`
  flex: 1.5;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: var(--spacing-5);
`

const SwitchLink = styled(Paragraph)`
  color: ${({ theme }) => theme.global.accent};
  background-color: ${({ theme }) => theme.bg.primary};
  padding: var(--spacing-1);
  cursor: pointer;

  &:hover {
    color: ${({ theme }) => tinycolor(theme.global.accent).darken(10).toString()};
  }
`

const SectionStyled = styled(Section)`
  min-width: 400px;
`

export default HomePage
