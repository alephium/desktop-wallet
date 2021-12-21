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

import { motion } from 'framer-motion'
import { FC } from 'react'
import styled, { useTheme } from 'styled-components'
import tinycolor from 'tinycolor2'

import alephiumLogo from '../../images/alephium_logo.svg'
import { ReactComponent as AtmosphericGlow } from '../../images/athmospheric_glow.svg'
import { ReactComponent as MountainSVG } from '../../images/mountain.svg'
import { deviceBreakPoints } from '../../style/globalStyles'
import { PanelContentContainer } from '../PageComponents/PageContainers'
import PanelTitle from '../PageComponents/PanelTitle'

const SideBar: FC<{ className?: string }> = ({ className }) => {
  const theme = useTheme()

  return (
    <Sidebar data-testid="sidebar">
      <AtmosphericGlowBackground
        initial={{ bottom: '-10vh', opacity: 0 }}
        animate={{ bottom: 0, opacity: 0.6 }}
        transition={{ delay: 1, duration: 1.2 }}
      />
      <SidebarContents>
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
      </SidebarContents>
    </Sidebar>
  )
}

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

const SidebarContents = styled(PanelContentContainer)`
  padding: var(--spacing-5);
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

const HeaderText = styled.div`
  margin-top: 5vh;
  max-width: 700px;
  color: ${({ theme }) => (theme.name === 'light' ? theme.font.contrastSecondary : theme.font.secondary)};

  @media ${deviceBreakPoints.mobile} {
    display: none;
  }
`

const PageSubtitle = styled.h3`
  margin-top: var(--spacing-1);
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

const AlephiumLogo = styled.div`
  background-image: url(${alephiumLogo});
  background-repeat: no-repeat;
  background-position: center;
  height: 10vh;
  width: 10vw;
  margin-top: var(--spacing-4);
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

export default SideBar
