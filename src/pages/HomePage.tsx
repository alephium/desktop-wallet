// Copyright 2018 - 2021 The Alephium Authors
// This file is part of the alephium project.
//
// The library is free software: you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// The library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public License
// along with the library. If not, see <http://www.gnu.org/licenses/>.

import React, { useCallback, useContext, useState } from 'react'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import tinycolor from 'tinycolor2'
import { useHistory } from 'react-router'
import { walletOpen, getStorage } from 'alephium-js'

import { GlobalContext } from '../App'
import { deviceBreakPoints } from '../style/globalStyles'
import { Input, Select } from '../components/Inputs'
import { Button } from '../components/Buttons'
import { FloatingPanel, Section } from '../components/PageComponents/PageContainers'
import Paragraph, { CenteredSecondaryParagraph } from '../components/Paragraph'
import AppHeader from '../components/AppHeader'
import SideBar from '../components/HomePage/SideBar'
import PanelTitle from '../components/PageComponents/PanelTitle'

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
              <CenteredSecondaryParagraph>
                Please choose an account and enter your password to continue.
              </CenteredSecondaryParagraph>
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

const Login = ({ usernames, onLinkClick }: { usernames: string[]; onLinkClick: () => void }) => {
  const [credentials, setCredentials] = useState({ username: '', password: '' })
  const { setWallet, setCurrentUsername, setSnackbarMessage } = useContext(GlobalContext)
  const history = useHistory()

  const login = async (callback: () => void) => {
    const walletEncrypted = Storage.load(credentials.username)
    if (walletEncrypted === null) {
      setSnackbarMessage({ text: 'Unknown account name', type: 'info' })
    } else {
      try {
        const wallet = await walletOpen(credentials.password, walletEncrypted)
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
    login(() => history.push('/wallet'))
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
        <Button onClick={handleLogin} submit>
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
      <CenteredSecondaryParagraph>
        Please choose whether you want to create a new wallet or import an existing one.
      </CenteredSecondaryParagraph>
      <Section inList>
        <Button onClick={() => history.push('/create')}>New wallet</Button>
        <Button onClick={() => history.push('/import')}>Import wallet</Button>
        {showLinkToExistingAccounts && <SwitchLink onClick={onLinkClick}>Use an existing account</SwitchLink>}
      </Section>
    </>
  )
}

// === Styling

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
