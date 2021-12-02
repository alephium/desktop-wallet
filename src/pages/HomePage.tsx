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
import styled, { useTheme } from 'styled-components'
import { motion } from 'framer-motion'
import tinycolor from 'tinycolor2'
import { useHistory } from 'react-router'
import { walletOpen, getStorage } from 'alephium-js'
import { Settings as SettingsIcon } from 'lucide-react'

import { GlobalContext } from '../App'
import { deviceBreakPoints } from '../style/globalStyles'
import { Input, Select } from '../components/Inputs'
import { Button } from '../components/Buttons'
import { MainPanel, PanelTitle, SectionContent } from '../components/PageComponents'
import Paragraph, { CenteredSecondaryParagraph } from '../components/Paragraph'
import AppHeader, { HeaderDivider } from '../components/AppHeader'
import NetworkBadge from '../components/NetworkBadge'

import alephiumLogo from '../images/alephium_logo.svg'
import { ReactComponent as MountainSVG } from '../images/mountain.svg'
import { ReactComponent as AtmosphericGlow } from '../images/athmospheric_glow.svg'

interface HomeProps {
  hasWallet: boolean
  usernames: string[]
}

const Storage = getStorage()

const HomePage = ({ hasWallet, usernames }: HomeProps) => {
  const history = useHistory()
  const [showActions, setShowActions] = useState(false)
  const theme = useTheme()

  const renderActions = () => <InitialActions hasWallet={hasWallet} setShowActions={setShowActions} />

  return (
    <HomeContainer initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
      <AppHeader>
        <NetworkBadge />
        <HeaderDivider />
        <SettingsButton transparent squared onClick={() => history.push('/settings')}>
          <SettingsIcon />
        </SettingsButton>
      </AppHeader>
      <Sidebar>
        <AtmosphericGlowBackground
          initial={{ bottom: '-10vh', opacity: 0 }}
          animate={{ bottom: 0, opacity: 0.6 }}
          transition={{ delay: 1, duration: 1.2 }}
        />
        <MainPanel transparentBg>
          <AlephiumLogo />
          <HeaderText>
            <PanelTitle
              color={theme.name === 'light' ? theme.font.contrastPrimary : theme.font.primary}
              backgroundColor="transparent"
              useLayoutId={false}
            >
              Alephium
            </PanelTitle>
            <PageSubtitle>Official Wallet</PageSubtitle>
            <p>The easiest way to get started with Alephium.</p>
          </HeaderText>
          <IllustrationsContainer>
            <Moon
              initial={{ bottom: '-10vh', opacity: 0 }}
              animate={{ bottom: '7vh', opacity: 1 }}
              transition={{ delay: 1, duration: 1.2 }}
            />
            <CloudGroup
              coordinates={[
                ['10px', '0px'],
                ['0px', '15px'],
                ['15px', '30px']
              ]}
              lengths={['30px', '20px', '25px']}
              style={{ bottom: '2vh' }}
              distance="5%"
              side="left"
            />
            <CloudGroup
              coordinates={[
                ['40px', '15px'],
                ['20px', '30px']
              ]}
              lengths={['25px', '32px']}
              style={{ bottom: '12vh' }}
              distance="40%"
              side="left"
            />
            <MountainImage />
          </IllustrationsContainer>
        </MainPanel>
      </Sidebar>
      <InteractionArea>
        <MainPanel verticalAlign="center" horizontalAlign="center">
          {showActions ? (
            <>
              <PanelTitle useLayoutId={false}>New account</PanelTitle>
              {renderActions()}
            </>
          ) : hasWallet ? (
            <>
              <PanelTitle useLayoutId={false}>Welcome back!</PanelTitle>
              <CenteredSecondaryParagraph>
                Please choose an account and enter your password to continue.
              </CenteredSecondaryParagraph>
              <Login setShowActions={setShowActions} usernames={usernames} />
            </>
          ) : (
            <>
              <PanelTitle useLayoutId={false}>Welcome!</PanelTitle>
              {renderActions()}
            </>
          )}
        </MainPanel>
      </InteractionArea>
    </HomeContainer>
  )
}

// === Components

const Login = ({
  usernames,
  setShowActions
}: {
  usernames: string[]
  setShowActions: React.Dispatch<React.SetStateAction<boolean>>
}) => {
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
      <SectionContent inList>
        <Select
          placeholder="Account"
          options={usernames.map((u) => ({ label: u, value: u }))}
          onValueChange={(value) => handleCredentialsChange('username', value?.value || '')}
          title="Select an account"
        />
        <Input
          placeholder="Password"
          type="password"
          autoComplete="off"
          onChange={(e) => handleCredentialsChange('password', e.target.value)}
          value={credentials.password}
        />
      </SectionContent>
      <SectionContent inList>
        <Button onClick={handleLogin} submit>
          Login
        </Button>
      </SectionContent>
      <SwitchLink onClick={() => setShowActions(true)}>Create / import a new wallet</SwitchLink>
    </>
  )
}

const InitialActions = ({
  hasWallet,
  setShowActions
}: {
  hasWallet: boolean
  setShowActions: React.Dispatch<React.SetStateAction<boolean>>
}) => {
  const history = useHistory()

  return (
    <>
      <CenteredSecondaryParagraph>
        Please choose wether you want to create a new wallet, or import an existing one.
      </CenteredSecondaryParagraph>
      <SectionContent inList>
        <Button onClick={() => history.push('/create')}>New wallet</Button>
        <Button onClick={() => history.push('/import')}>Import wallet</Button>
        {hasWallet && <SwitchLink onClick={() => setShowActions(false)}>Use an existing account</SwitchLink>}
      </SectionContent>
    </>
  )
}

// === Styling

const HomeContainer = styled(motion.main)`
  display: flex;
  flex: 1;

  @media ${deviceBreakPoints.mobile} {
    flex-direction: column;
  }
`

const Sidebar = styled.div`
  flex: 0.5;
  min-width: 300px;
  background-color: ${({ theme }) => (theme.name === 'light' ? theme.bg.contrast : theme.bg.primary)};
  position: relative;
  overflow: hidden;
  padding: 3vw;

  @media ${deviceBreakPoints.mobile} {
    flex: 0.8;
    min-width: initial;
    display: flex;
    align-items: center;
  }
`

const IllustrationsContainer = styled.div`
  @media ${deviceBreakPoints.mobile} {
    display: none;
  }
`

const AtmosphericGlowBackground = styled(motion(AtmosphericGlow))`
  position: absolute;
  bottom: 0;
  right: 0;
  left: 0;
  height: 300px;
  transform: scale(3.5) translateY(25%);
  opacity: 0.6;

  @media ${deviceBreakPoints.mobile} {
    transform: scale(3.5) translateY(35%);
  }
`

const InteractionArea = styled.div`
  flex: 1.5;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 25px;
`

const HeaderText = styled.div`
  margin-top: 5vh;
  max-width: 700px;
  color: ${({ theme }) => (theme.name === 'light' ? theme.font.contrastSecondary : theme.font.secondary)};

  @media ${deviceBreakPoints.mobile} {
    display: none;
  }
`

const PageSubtitle = styled.h3`
  margin-top: 5px;
`

const Moon = styled(motion.div)`
  position: absolute;
  right: 25%;
  height: 10vw;
  width: 10vw;
  max-height: 60px;
  max-width: 60px;
  border-radius: 200px;
  background-color: ${({ theme }) => theme.global.secondary};
`

const MountainImage = styled(MountainSVG)`
  position: absolute;
  width: 70%;
  height: 25%;
  bottom: -2px;

  path {
    fill: #1a0914;
  }
`

const CloudGroup = ({
  coordinates,
  lengths,
  side,
  distance,
  style
}: {
  coordinates: [string, string][]
  lengths: string[]
  side: 'right' | 'left'
  distance: string
  style?: React.CSSProperties | undefined
}) => {
  const clouds = []

  for (let i = 0; i < coordinates.length; i++) {
    clouds.push(<Cloud key={i} style={{ left: coordinates[i][0], top: coordinates[i][1], width: lengths[i] }} />)
  }

  return (
    <StyledCloudGroup
      initial={{ [side]: '-100px' }}
      animate={{ [side]: distance }}
      transition={{ delay: 1, duration: 0.5 }}
      style={style}
    >
      {clouds}
    </StyledCloudGroup>
  )
}

const StyledCloudGroup = styled(motion.div)`
  height: 50px;
  width: 100px;
  position: absolute;
`

const Cloud = styled.div`
  position: absolute;
  background-color: ${({ theme }) => tinycolor(theme.global.secondary).setAlpha(0.3).toString()};
  height: 3px;
`

const SwitchLink = styled(Paragraph)`
  color: ${({ theme }) => theme.global.accent};
  background-color: ${({ theme }) => theme.bg.primary};
  padding: 5px;
  cursor: pointer;

  &:hover {
    color: ${({ theme }) => tinycolor(theme.global.accent).darken(10).toString()};
  }
`

const AlephiumLogo = styled.div`
  background-image: url(${alephiumLogo});
  background-repeat: no-repeat;
  background-position: center;
  height: 10vh;
  width: 10vw;
  margin-top: 20px;
  max-width: 60px;
  min-width: 30px;

  @media ${deviceBreakPoints.mobile} {
    margin: auto;
    max-width: 80px;
    width: 15vw;
    height: 15vh;
    z-index: 1;
  }
`

const SettingsButton = styled(Button)``

export default HomePage
