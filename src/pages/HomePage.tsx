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
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'

import { fadeInSlowly } from '@/animations'
import ActionLink from '@/components/ActionLink'
import AppHeader from '@/components/AppHeader'
import Button from '@/components/Button'
import Input from '@/components/Inputs/Input'
import Select from '@/components/Inputs/Select'
import WalletPassphrase from '@/components/Inputs/WalletPassphrase'
import { FloatingPanel, Section } from '@/components/PageComponents/PageContainers'
import PanelTitle from '@/components/PageComponents/PanelTitle'
import Paragraph from '@/components/Paragraph'
import { useGlobalContext } from '@/contexts/global'

const HomePage = () => {
  const [showInitialActions, setShowInitialActions] = useState(false)
  const { walletNames } = useGlobalContext()
  const { t } = useTranslation('App')

  const hasWallet = walletNames.length > 0

  const hideInitialActions = () => setShowInitialActions(false)
  const displayInitialActions = () => setShowInitialActions(true)

  return (
    <HomeContainer {...fadeInSlowly}>
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
      <AppHeader />
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
  const { unlockWallet } = useGlobalContext()
  const navigate = useNavigate()
  const [passphrase, setPassphrase] = useState('')
  const [isPassphraseConfirmed, setIsPassphraseConfirmed] = useState(false)

  const handleCredentialsChange = useCallback((type: 'walletName' | 'password', value: string) => {
    setCredentials((prev) => ({ ...prev, [type]: value }))
  }, [])

  const handleLogin = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault()
    unlockWallet(credentials.walletName, credentials.password, () => navigate('/wallet/overview'), passphrase)

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
        <WalletPassphraseStyled
          onPassphraseConfirmed={setPassphrase}
          setIsPassphraseConfirmed={setIsPassphraseConfirmed}
        />
      </SectionStyled>
      <SectionStyled>
        <ButtonStyled
          onClick={handleLogin}
          submit
          disabled={!credentials.walletName || !credentials.password || !isPassphraseConfirmed}
        >
          {t`Login`}
        </ButtonStyled>
      </SectionStyled>
      <SwitchLink onClick={onLinkClick}>{t`Create / import a new wallet`}</SwitchLink>
    </>
  )
}

const InitialActions = ({
  showLinkToExistingWallets,
  onLinkClick = () => ({})
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
        {showLinkToExistingWallets && <SwitchLink onClick={onLinkClick}>{t`Use an existing wallet`}</SwitchLink>}
      </Section>
    </>
  )
}

export default HomePage

const HomeContainer = styled(motion.main)`
  display: flex;
  flex: 1;
  height: 100%;
  background-color: ${({ theme }) => theme.bg.secondary};
`

const InteractionArea = styled.div`
  flex: 1.5;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: var(--spacing-5);
`

const SectionStyled = styled(Section)`
  min-width: 400px;
`

const ButtonStyled = styled(Button)`
  margin-top: 20px;
`

const SwitchLink = styled(ActionLink)`
  font-weight: var(--fontWeight-medium);
  font-size: 12px;
  font-family: inherit;
  height: var(--inputHeight);
`

const WalletPassphraseStyled = styled(WalletPassphrase)`
  margin: 16px 0;
  width: 100%;
`
