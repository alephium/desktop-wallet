/*
Copyright 2018 - 2023 The Alephium Authors
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
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { fadeInSlowly } from '@/animations'
import AppHeader from '@/components/AppHeader'
import { FloatingPanel } from '@/components/PageComponents/PageContainers'
import PanelTitle from '@/components/PageComponents/PanelTitle'
import SideBar from '@/components/PageComponents/SideBar'
import Scrollbar from '@/components/Scrollbar'
import { useAppSelector } from '@/hooks/redux'
import { ReactComponent as AlephiumLogotype } from '@/images/logotype.svg'
import NewWalletActions from '@/pages/HomePage/NewWalletActions'
import UnlockPanel from '@/pages/HomePage/UnlockPanel'

const HomePage = () => {
  const { t } = useTranslation()
  const hasAtLeastOneWallet = useAppSelector((state) => state.global.wallets.length > 0)

  const [showNewWalletActions, setShowNewWalletActions] = useState(false)

  return (
    <HomeContainer {...fadeInSlowly}>
      <SideBar animateEntry>
        <Logo>
          <AlephiumLogotypeStyled />
        </Logo>
      </SideBar>
      <Scrollbar>
        <MainContent>
          <FloatingPanel verticalAlign="center" horizontalAlign="center" transparentBg borderless>
            {showNewWalletActions ? (
              <>
                <PanelTitle useLayoutId={false} size="big">
                  {t('New wallet')}
                </PanelTitle>
                <NewWalletActions onExistingWalletLinkClick={() => setShowNewWalletActions(false)} />
              </>
            ) : hasAtLeastOneWallet ? (
              <UnlockPanel onNewWalletLinkClick={() => setShowNewWalletActions(true)} />
            ) : (
              <>
                <PanelTitle useLayoutId={false} size="big">
                  {t('Welcome.')}
                </PanelTitle>
                <NewWalletActions />
              </>
            )}
          </FloatingPanel>
        </MainContent>
        <AppHeader />
      </Scrollbar>
    </HomeContainer>
  )
}

export default HomePage

const HomeContainer = styled(motion.main)`
  display: flex;
  flex: 1;
  height: 100%;
  background-color: ${({ theme }) => theme.bg.background1};
`

const Logo = styled.div`
  padding: 5px;
`

const AlephiumLogotypeStyled = styled(AlephiumLogotype)`
  fill: ${({ theme }) => theme.font.primary};
  color: ${({ theme }) => theme.font.primary};
`

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 100vh;
`
