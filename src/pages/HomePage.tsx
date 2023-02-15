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
import SideBar from '@/components/PageComponents/SideBar'
import Paragraph from '@/components/Paragraph'
import { useGlobalContext } from '@/contexts/global'
import { useAppSelector } from '@/hooks/redux'
import { ReactComponent as AlephiumLogotype } from '@/images/logotype.svg'

const HomePage = () => {
  const { t } = useTranslation()
  const walletNames = useAppSelector((state) => state.app.storedWalletNames)

  const [showInitialActions, setShowInitialActions] = useState(false)

  const hasWallet = walletNames.length > 0

  const hideInitialActions = () => setShowInitialActions(false)
  const displayInitialActions = () => setShowInitialActions(true)

  return (
    <HomeContainer {...fadeInSlowly}>
      <SideBar>
        <Logo>
          <AlephiumLogotypeStyled />
        </Logo>
      </SideBar>
      <FloatingPanel verticalAlign="center" horizontalAlign="center" transparentBg borderless>
        {!showInitialActions && !hasWallet && (
          <>
            <PanelTitle useLayoutId={false} size="big">
              {t('Welcome.')}
            </PanelTitle>
            <InitialActions />
          </>
        )}
        {!showInitialActions && hasWallet && (
          <>
            <PanelTitle useLayoutId={false} isSticky={false} size="big">
              {t('Welcome back.')}
            </PanelTitle>
            <ParagraphStyled centered secondary>
              {t('Unlock a wallet to continue.')}
            </ParagraphStyled>
            <Login onLinkClick={displayInitialActions} walletNames={walletNames} />
          </>
        )}
        {showInitialActions && (
          <>
            <PanelTitle useLayoutId={false} size="big">
              {t('New wallet')}
            </PanelTitle>
            <InitialActions showLinkToExistingWallets onLinkClick={hideInitialActions} />
          </>
        )}
      </FloatingPanel>
      <AppHeader />
    </HomeContainer>
  )
}

interface LoginProps {
  walletNames: string[]
  onLinkClick: () => void
}

const Login = ({ walletNames, onLinkClick }: LoginProps) => {
  const { t } = useTranslation()
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

    unlockWallet({
      event: 'login',
      ...credentials,
      afterUnlock: () => navigate('/wallet/overview'),
      passphrase
    })

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
      <ButtonsSection>
        <ButtonStyled
          onClick={handleLogin}
          submit
          disabled={!credentials.walletName || !credentials.password || !isPassphraseConfirmed}
        >
          {t('Unlock')}
        </ButtonStyled>
        <ButtonStyled onClick={onLinkClick} role="secondary" borderless variant="contrast">
          {t('Import or create a wallet')}
        </ButtonStyled>
      </ButtonsSection>
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
  const { t } = useTranslation()

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
  background-color: ${({ theme }) => theme.bg.background1};
`

const SectionStyled = styled(Section)`
  min-width: 328px;
`

const ButtonsSection = styled(SectionStyled)`
  margin-top: 30px;
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
  position: fixed;
  bottom: 5px;
  right: 20px;
  border: 1px solid ${({ theme }) => theme.border.secondary};
`

const ParagraphStyled = styled(Paragraph)`
  font-weight: var(--fontWeight-bold);
  font-size: 16px;
`

const Logo = styled.div`
  padding: 5px;
`

const AlephiumLogotypeStyled = styled(AlephiumLogotype)`
  fill: ${({ theme }) => theme.font.primary};
  color: ${({ theme }) => theme.font.primary};
`
