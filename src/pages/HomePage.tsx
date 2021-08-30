import React, { useCallback, useContext, useState } from 'react'
import styled, { useTheme } from 'styled-components'

import { ReactComponent as TreesSVG } from '../images/trees.svg'
import { ReactComponent as MountainSVG } from '../images/mountain.svg'
import { motion } from 'framer-motion'
import { Form, Input, Select } from '../components/Inputs'
import { Button } from '../components/Buttons'
import tinycolor from 'tinycolor2'
import { PageContainer, MainContainer, PageTitle, SectionContent } from '../components/PageComponents'
import { useHistory } from 'react-router'
import Paragraph from '../components/Paragraph'
import { walletOpen, getStorage, NetworkId } from 'alf-client'
import { GlobalContext } from '../App'
import { Settings as SettingsIcon } from 'lucide-react'

interface HomeProps {
  hasWallet: boolean
  usernames: string[]
  networkId: NetworkId
}

const Storage = getStorage()

const HomePage = ({ hasWallet, usernames, networkId }: HomeProps) => {
  const history = useHistory()
  const [showActions, setShowActions] = useState(false)
  const theme = useTheme()

  const renderActions = () => <InitialActions hasWallet={hasWallet} setShowActions={setShowActions} />

  return (
    <PageContainer>
      <Header>
        <MainContainer>
          <SettingsButton transparent squared onClick={() => history.push('/settings')}>
            <SettingsIcon />
          </SettingsButton>
          <HeaderText>
            <PageTitle color={theme.font.contrast} backgroundColor={theme.font.primary}>
              Hi there!
            </PageTitle>
            <h3>Welcome to the Alephium Wallet!</h3>
            <p>Use the smart money of the future while keeping your mind at ease.</p>
          </HeaderText>
          <Moon initial={{ bottom: '-2vh' }} animate={{ bottom: '7vh' }} transition={{ delay: 0.2, duration: 1.2 }} />
          <CloudGroup
            coordinates={[
              ['10px', '0px'],
              ['0px', '15px'],
              ['15px', '30px']
            ]}
            lengths={['30px', '20px', '25px']}
            style={{ bottom: '2vh' }}
            distance="10px"
            side="left"
          />
          <CloudGroup
            coordinates={[
              ['40px', '15px'],
              ['20px', '30px']
            ]}
            lengths={['25px', '32px']}
            style={{ bottom: '10vh' }}
            distance="40%"
            side="left"
          />
          <MountainImage />
        </MainContainer>
      </Header>
      <InteractionArea>
        <MainContainer>
          {showActions ? (
            renderActions()
          ) : hasWallet ? (
            <Login setShowActions={setShowActions} usernames={usernames} networkId={networkId} />
          ) : (
            renderActions()
          )}
          <TreesImage />
        </MainContainer>
      </InteractionArea>
    </PageContainer>
  )
}

// === Components

const Login = ({
  usernames,
  networkId,
  setShowActions
}: {
  usernames: string[]
  networkId: NetworkId
  setShowActions: React.Dispatch<React.SetStateAction<boolean>>
}) => {
  const [credentials, setCredentials] = useState({ username: '', password: '' })
  const { setWallet, setCurrentUsername, setSnackbarMessage } = useContext(GlobalContext)
  const history = useHistory()

  const login = async (callback: () => void) => {
    const walletEncrypted = Storage.load(credentials.username)
    if (walletEncrypted === null) {
      setSnackbarMessage({ text: 'Unknown username', type: 'info' })
    } else {
      try {
        const wallet = await walletOpen(credentials.password, walletEncrypted, networkId)
        if (wallet) {
          setWallet(wallet)
          setCurrentUsername(credentials.username)
          callback()
        }
      } catch (e) {
        console.error(e)
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
    <SectionContent>
      <Form>
        <Select
          placeholder="Username"
          options={usernames.map((u) => ({ label: u, value: u }))}
          onValueChange={(value) => handleCredentialsChange('username', value?.value || '')}
        />
        <Input
          placeholder="Password"
          type="password"
          autoComplete="off"
          onChange={(e) => handleCredentialsChange('password', e.target.value)}
          value={credentials.password}
        />
        <Button onClick={handleLogin} type="submit">
          Login
        </Button>
        <SwitchLink onClick={() => setShowActions(true)}>Create / import a new wallet</SwitchLink>
      </Form>
    </SectionContent>
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
    <SectionContent style={{ marginTop: '2vh' }}>
      <Button onClick={() => history.push('/create')}>New wallet</Button>
      <Button onClick={() => history.push('/import')}>Import wallet</Button>
      {hasWallet && <SwitchLink onClick={() => setShowActions(false)}>Use an existing account</SwitchLink>}
    </SectionContent>
  )
}

// === Styling

const Header = styled.header`
  flex: 1;
  background-color: ${({ theme }) => theme.bg.contrast};
  position: relative;
  overflow: hidden;
`

const InteractionArea = styled.div`
  flex: 0.8;
  position: relative;
  display: flex;
  flex-direction: column;
`

const HeaderText = styled.div`
  margin-top: 2vh;
  max-width: 700px;
  color: ${({ theme }) => theme.font.contrast};
`

const Moon = styled(motion.div)`
  position: absolute;
  right: 3vw;
  height: 15vw;
  width: 15vw;
  max-height: 80px;
  max-width: 80px;
  border-radius: 200px;
  background-color: ${({ theme }) => theme.global.secondary};
`

const MountainImage = styled(MountainSVG)`
  position: absolute;
  width: 100%;
  height: 40%;
  bottom: -2px;
`

const TreesImage = styled(TreesSVG)`
  position: absolute;
  bottom: 3vh;
  left: 5vw;
  width: 50vw;
  height: 100px;
  max-width: 300px;
  z-index: -1;

  path {
    stroke: ${({ theme }) => theme.font.primary};
    stroke-width: 3px;
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
      transition={{ delay: 0.1, duration: 0.5 }}
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
  background-color: ${({ theme }) => tinycolor(theme.bg.primary).setAlpha(0.9).toString()};
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

const SettingsButton = styled(Button)`
  position: fixed;
  top: 0;
  right: 0;
  margin: 5px;
  z-index: 10;
`

export default HomePage
