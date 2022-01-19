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

import { getStorage, walletOpen } from 'alephium-js'
import { motion } from 'framer-motion'
import React, { useCallback, useState } from 'react'
import { useHistory } from 'react-router'
import styled from 'styled-components'
import tinycolor from 'tinycolor2'

import AppHeader from '../components/AppHeader'
import Button from '../components/Button'
import SideBar from '../components/HomePage/SideBar'
import Input from '../components/Inputs/Input'
import Select from '../components/Inputs/Select'
import { FloatingPanel, Section } from '../components/PageComponents/PageContainers'
import PanelTitle from '../components/PageComponents/PanelTitle'
import Paragraph from '../components/Paragraph'
import { useGlobalContext } from '../contexts/global'
import { deviceBreakPoints } from '../style/globalStyles'

interface HomeProps {
  hasWallet: boolean
  usernames: string[]
}

const Storage = getStorage()

const HomePage = ({ hasWallet, usernames }: HomeProps) => {
  const history = useHistory()
  const [showInitialActions, setShowInitialActions] = useState(false)
  const hideInitialActions = () => setShowInitialActions(false)
  const displayInitialActions = () => setShowInitialActions(true)

  return (
    <HomeContainer initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
      <AppHeader onSettingsClick={() => history.push('/settings')} />
      <SideBar />
      <InteractionArea>
        <FloatingPanel verticalAlign="center" horizontalAlign="center">
          {!showInitialActions && !hasWallet && (
            <>
              <PanelTitle useLayoutId={false}>Welcome!</PanelTitle>
              <InitialActions />
            </>
          )}
          {!showInitialActions && hasWallet && (
            <>
              <PanelTitle useLayoutId={false}>Welcome back!</PanelTitle>
              <Paragraph centered secondary>
                Please choose an account and enter your password to continue.
              </Paragraph>
              <Login onLinkClick={displayInitialActions} usernames={usernames} />
            </>
          )}
          {showInitialActions && (
            <>
              <PanelTitle useLayoutId={false}>New account</PanelTitle>
              <InitialActions showLinkToExistingAccounts onLinkClick={hideInitialActions} />
            </>
          )}
        </FloatingPanel>
      </InteractionArea>
    </HomeContainer>
  )
}

// === Components

interface LoginProps {
  usernames: string[]
  onLinkClick: () => void
}

const Login = ({ usernames, onLinkClick }: LoginProps) => {
  const [credentials, setCredentials] = useState({ username: '', password: '' })
  const { setWallet, setCurrentUsername, setSnackbarMessage } = useGlobalContext()
  const history = useHistory()

  const login = async (callback: () => void) => {
    const walletEncrypted = Storage.load(credentials.username)
    if (walletEncrypted === null) {
      setSnackbarMessage({ text: 'Unknown account name', type: 'info' })
    } else {
      try {
        const wallet = walletOpen(credentials.password, walletEncrypted)
        if (wallet) {
          setWallet(wallet)
          setCurrentUsername(credentials.username)
          callback()
        }
      } catch (e) {
        setSnackbarMessage({ text: 'Invalid password', type: 'alert' })
      }
    }
  }

  const handleCredentialsChange = useCallback((type: 'username' | 'password', value: string) => {
    setCredentials((prev) => ({ ...prev, [type]: value }))
  }, [])

  const handleLogin = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault()
    login(() => history.push('/wallet/overview'))
  }

  return (
    <>
      <Section inList>
        <Select
          placeholder="Account"
          options={usernames.map((u) => ({ label: u, value: u }))}
          onValueChange={(value) => handleCredentialsChange('username', value?.value || '')}
          title="Select an account"
          id="account"
        />
        <Input
          placeholder="Password"
          type="password"
          autoComplete="off"
          onChange={(e) => handleCredentialsChange('password', e.target.value)}
          value={credentials.password}
          id="password"
        />
      </Section>
      <Section inList>
        <Button onClick={handleLogin} submit disabled={!credentials.username || !credentials.password}>
          Login
        </Button>
      </Section>
      <SwitchLink onClick={onLinkClick}>Create / import a new wallet</SwitchLink>
    </>
  )
}

const InitialActions = ({
  showLinkToExistingAccounts,
  onLinkClick
}: {
  showLinkToExistingAccounts?: boolean
  onLinkClick?: () => void
}) => {
  const history = useHistory()

  return (
    <>
      <Paragraph centered secondary>
        Please choose whether you want to create a new wallet or import an existing one.
      </Paragraph>
      <Section inList>
        <Button onClick={() => history.push('/create')}>New wallet</Button>
        <Button onClick={() => history.push('/import')}>Import wallet</Button>
        {showLinkToExistingAccounts && <SwitchLink onClick={onLinkClick}>Use an existing account</SwitchLink>}
      </Section>
    </>
  )
}

const HomeContainer = styled(motion.div)`
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

export default HomePage
