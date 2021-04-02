import React from 'react'
import styled from 'styled-components'

import {ReactComponent as TreesSVG} from '../images/trees.svg'
import {ReactComponent as MountainSVG} from '../images/mountain.svg'
import { motion } from 'framer-motion'
import { Input } from '../components/Inputs'
import { Button } from '../components/Buttons'

const Home = () => {
  return (
    <Container>
      <Header>
        <HeaderText>
          <H1>Hi there!</H1>
          <h3>Welcome to the Alephium Wallet!</h3>
          <p>
            Use the smart money of the future while keeping your mind at ease.
          </p>
        </HeaderText>
        <CloudGroup
          coordinates={[['10px', '0px'], ['0px', '15px'], ['15px', '30px']]}
          lengths={['30px', '20px', '25px' ]}
          style={{ top: '30vh' }}
          distance="10px"
          side="left"
        />
        <CloudGroup
          coordinates={[['10px', '0px'], ['20px', '15px'], ['55px', '30px']]}
          lengths={['30px', '40px', '25px' ]}
          style={{ top: '25vh' }}
          distance="160px"
          side="right"
        />
        <Moon
          initial={{ bottom: '-2vh' }}
          animate={{ bottom: '10vh' }}
          transition={{ delay: 0.2, duration: 1.2 }}
        />
        <MountainImage />
      </Header>
      <Content>
        <Input placeholder="Username" />
        <Input placeholder="Password" />
				<Button>Login</Button>
        <TreesImage />
      </Content>
    </Container>
  )
}

// === Styling

const Container = styled.section`
  flex: 1;
  display: flex;
  flex-direction: column;
`

const Header = styled.header`
  flex: 1;
  background-color: ${({theme}) => theme.bg.contrast };
  position: relative;
  overflow: hidden;
`

const HeaderText = styled.div`
 margin: auto;
 padding: 0 8vw;
 max-width: 700px;
 color: ${({theme}) => theme.font.contrast};
`

const H1 = styled.h1`
  color: ${({theme}) => theme.font.contrast};
`

const Content = styled.div`
  flex: 1.2;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-direction: column;
	padding: 0 8vw;

	input {
		width: 100%;
	}
`

const Moon = styled(motion.div)`
  position: absolute;
  right: 6vw;
  height: 80px;
  width: 80px;
  border-radius: 200px;
  background-color: ${({theme}) => theme.global.accent};
`

const MountainImage = styled(MountainSVG)`
  position: absolute;
  width: 100%;
  bottom: -2px;
  height: 40%;
`

const TreesImage = styled(TreesSVG)`
  position: absolute;
  bottom: 3vh;
  left: 5vw;
  width: 50vw;
  height: 20vw;
  max-width: 600px;

  path {
    stroke: ${({theme}) => theme.font.primary };
    stroke-width: 3px;
  }
`


const CloudGroup = ({coordinates, lengths, side, distance, style}: {coordinates: [string, string][], lengths: string[], side: 'right' | 'left', distance: string, style?: React.CSSProperties | undefined}) => {

  let clouds = []

  for (let i = 0; i < coordinates.length; i++) {
    clouds.push(
      <Cloud style={{ left: coordinates[i][0], top: coordinates[i][1], width: lengths[i] }} />
    )
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
  height: 100px;
  width: 100px;
  position: absolute;
`

const Cloud = styled.div`
  position: absolute;
  background-color: ${({ theme }) => theme.bg.primary};
  height: 3px;
`

export default Home