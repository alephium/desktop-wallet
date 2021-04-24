import React, { useContext, useState } from 'react'
import styled from 'styled-components'

import { ReactComponent as TreesSVG } from '../images/trees.svg'
import { ReactComponent as MountainSVG } from '../images/mountain.svg'
import { motion } from 'framer-motion'
import { Input, Select } from '../components/Inputs'
import { Button } from '../components/Buttons'
import tinycolor from 'tinycolor2'
import { PageContainer, MainContainer, PageTitle, SectionContent } from '../components/PageComponents'
import { useHistory } from 'react-router'
import Paragraph from '../components/Paragraph'
import { walletOpen, Storage } from 'alf-client'
import { NetworkTypeString } from '../types'
import { GlobalContext } from '../App'

interface HomeProps {
  hasWallet: boolean
  usernames: string[]
  networkType: NetworkTypeString
}

const HomePage = ({ hasWallet, usernames, networkType }: HomeProps) => {
  const [showActions, setShowActions] = useState(false)

  const renderActions = () => <InitialActions hasWallet={hasWallet} setShowActions={setShowActions} />

  return (
    <PageContainer>
      <Header>
        <MainContainer>
          <HeaderText>
            <PageTitle color="contrast">Hi there!</PageTitle>
            <h3>Welcome to the Alephium Wallet!</h3>
            <p>Use the smart money of the future while keeping your mind at ease.</p>
          </HeaderText>
          <Moon initial={{ bottom: '-2vh' }} animate={{ bottom: '10vh' }} transition={{ delay: 0.2, duration: 1.2 }} />
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
              ['10px', '0px'],
              ['20px', '15px'],
              ['55px', '30px']
            ]}
            lengths={['30px', '40px', '25px']}
            style={{ top: '3vh' }}
            distance="20px"
            side="right"
          />
          <MountainImage />
        </MainContainer>
      </Header>
      <InteractionArea>
        <MainContainer>
          {showActions ? (
            renderActions()
          ) : hasWallet ? (
            <Login setShowActions={setShowActions} usernames={usernames} networkType={networkType} />
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
  networkType,
  setShowActions
}: {
  usernames: string[]
  networkType: NetworkTypeString
  setShowActions: React.Dispatch<React.SetStateAction<boolean>>
}) => {
  const [credentials, setCredentials] = useState({ username: '', password: '' })
  const { setWallet, setSnackbarMessage } = useContext(GlobalContext)
  const history = useHistory()

  const login = async (callback: () => void) => {
    const walletEncrypted = Storage().load(credentials.username)
    if (walletEncrypted === null) {
      setSnackbarMessage({ text: 'Unknown username', type: 'info' })
    } else {
      try {
        const wallet = await walletOpen(credentials.password, walletEncrypted, networkType)
        if (wallet) {
          setWallet(wallet)
          callback()
        }
      } catch (e) {
        setSnackbarMessage({ text: 'Invalid password', type: 'alert' })
      }
    }
  }

  const handleCredentialsChange = (type: 'username' | 'password', value: string) => {
    setCredentials((prev) => ({ ...prev, [type]: value }))
  }

  const handleLogin = () => {
    login(() => history.push('/wallet'))
  }

  return (
    <SectionContent>
      <Select
        placeholder="Username"
        options={usernames.map((u) => ({ label: u, value: u }))}
        onValueChange={(value) => handleCredentialsChange('username', value?.value || '')}
      />
      <Input
        placeholder="Password"
        type="password"
        onChange={(e) => handleCredentialsChange('password', e.target.value)}
        value={credentials.password}
      />
      <Button onClick={handleLogin}>Login</Button>
      <SwitchLink onClick={() => setShowActions(true)}>Create / import a new wallet</SwitchLink>
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

  const handleClick = () => {
    history.push('/create')
  }

  return (
    <SectionContent style={{ marginTop: '2vh' }}>
      <Button onClick={handleClick}>New wallet</Button>
      <Button>Import wallet</Button>
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
  right: 6vw;
  height: 15vw;
  width: 15vw;
  max-height: 80px;
  max-width: 80px;
  border-radius: 200px;
  background-color: ${({ theme }) => theme.global.accent};
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

export default HomePage
