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

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'

import Button from '@/components/Button'
import Input from '@/components/Inputs/Input'
import Select from '@/components/Inputs/Select'
import WalletPassphrase from '@/components/Inputs/WalletPassphrase'
import { Section } from '@/components/PageComponents/PageContainers'
import PanelTitle from '@/components/PageComponents/PanelTitle'
import Paragraph from '@/components/Paragraph'
import { useGlobalContext } from '@/contexts/global'
import { useAppSelector } from '@/hooks/redux'

interface LoginPanelProps {
  onNewWalletLinkClick: () => void
}

const LoginPanel = ({ onNewWalletLinkClick }: LoginPanelProps) => {
  const { t } = useTranslation()
  const wallets = useAppSelector((state) => state.app.wallets)
  const { unlockWallet } = useGlobalContext()
  const navigate = useNavigate()

  const walletOptions = wallets.map(({ id, name }) => ({ label: name, value: id }))
  const defaultOption = walletOptions.length > 0 ? walletOptions[0] : undefined

  const [selectedWalletOption, setSelectedWalletOption] = useState(defaultOption)
  const [password, setPassword] = useState('')
  const [passphrase, setPassphrase] = useState('')
  const [isPassphraseConfirmed, setIsPassphraseConfirmed] = useState(false)

  if (walletOptions.length === 0) return null

  const handleLogin = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault()

    if (!selectedWalletOption) return

    unlockWallet({
      event: 'login',
      walletId: selectedWalletOption.value,
      password,
      passphrase,
      afterUnlock: () => navigate('/wallet/overview')
    })

    if (passphrase) setPassphrase('')
  }

  return (
    <>
      <PanelTitle useLayoutId={false} isSticky={false} size="big">
        {t('Welcome back.')}
      </PanelTitle>
      <ParagraphStyled centered secondary>
        {t(wallets.length === 1 ? 'Unlock your wallet to continue.' : 'Unlock a wallet to continue.')}
      </ParagraphStyled>
      <SectionStyled inList>
        <Select
          label={t('Wallet')}
          options={walletOptions}
          onValueChange={setSelectedWalletOption}
          title={t('Select a wallet')}
          id="wallet"
        />
        <Input
          label={t('Password')}
          type="password"
          autoComplete="off"
          onChange={(e) => setPassword(e.target.value)}
          value={password}
          id="password"
        />
      </SectionStyled>
      <ButtonsSection>
        <ButtonStyled
          onClick={handleLogin}
          submit
          disabled={!selectedWalletOption || !password || !isPassphraseConfirmed}
        >
          {t('Unlock')}
        </ButtonStyled>
        <ButtonStyled onClick={onNewWalletLinkClick} role="secondary" borderless variant="contrast">
          {t('Import or create a wallet')}
        </ButtonStyled>
      </ButtonsSection>
      <WalletPassphraseStyled
        onPassphraseConfirmed={setPassphrase}
        setIsPassphraseConfirmed={setIsPassphraseConfirmed}
      />
    </>
  )
}

export default LoginPanel

const SectionStyled = styled(Section)`
  min-width: 328px;
`

const ButtonsSection = styled(SectionStyled)`
  margin-top: 30px;
`

const ButtonStyled = styled(Button)`
  margin-top: 20px;
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
