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
import { Settings, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { css, useTheme } from 'styled-components'

import { fadeInOutScaleFast } from '@/animations'
import Button from '@/components/Button'
import Scrollbar from '@/components/Scrollbar'
import { TabItem } from '@/components/TabBar'
import { useAppSelector } from '@/hooks/redux'
import discordLogo from '@/images/brand-icon-discord.svg'
import githubLogo from '@/images/brand-icon-github.svg'
import twitterLogo from '@/images/brand-icon-twitter.svg'
import ModalContainer from '@/modals/ModalContainer'
import DevToolsSettingsSection from '@/modals/SettingsModal/DevToolsSettingsSection'
import GeneralSettingsSection from '@/modals/SettingsModal/GeneralSettingsSection'
import NetworkSettingsSection from '@/modals/SettingsModal/NetworkSettingsSection'
import WalletsSettingsSection from '@/modals/SettingsModal/WalletsSettingsSection'
import { links } from '@/utils/links'
import { openInWebBrowser } from '@/utils/misc'

type SettingsModalTabNames = 'general' | 'wallets' | 'network' | 'devtools'

interface SettingsTabItem extends TabItem {
  value: SettingsModalTabNames
}

interface SocialMediaLogo {
  media: keyof Pick<typeof links, 'twitter' | 'discord' | 'github'>
  img: string
}

const socialMediaLogos: SocialMediaLogo[] = [
  { media: 'twitter', img: twitterLogo },
  { media: 'discord', img: discordLogo },
  { media: 'github', img: githubLogo }
]

interface SettingsModalProps {
  onClose: () => void
  initialTabValue?: SettingsModalTabNames
}

const SettingsModal = ({ onClose, initialTabValue }: SettingsModalProps) => {
  const { t } = useTranslation()
  const theme = useTheme()
  const isAuthenticated = useAppSelector((s) => !!s.activeWallet.mnemonic)

  const settingsModalTabs: SettingsTabItem[] = useMemo(
    () => [
      { value: 'general', label: t('General') },
      { value: 'wallets', label: t('Wallets') },
      { value: 'network', label: t('Network') },
      { value: 'devtools', label: t('Developer tools') }
    ],
    [t]
  )
  const activeTab = settingsModalTabs.find((t) => t.value === initialTabValue) || settingsModalTabs[0]

  const [currentTab, setCurrentTab] = useState<TabItem>(activeTab)

  const enabledTabs = !isAuthenticated
    ? settingsModalTabs.filter(({ value }) => value !== 'devtools')
    : settingsModalTabs

  useEffect(() => {
    setCurrentTab(activeTab)
  }, [activeTab])

  return (
    <ModalContainer onClose={onClose}>
      <CenteredBox role="dialog" {...fadeInOutScaleFast}>
        <TabTitlesColumn>
          <TabTitlesColumnHeader>
            <ColumnTitle>
              <Settings color={theme.font.secondary} strokeWidth={1} />
              {t('Settings')}
            </ColumnTitle>
          </TabTitlesColumnHeader>
          <TabTitlesColumnContent>
            <TabTitles>
              {enabledTabs.map((tab) => (
                <TabTitleButton
                  key={tab.value}
                  role="secondary"
                  wide
                  transparent={currentTab.value !== tab.value}
                  borderless={currentTab.value !== tab.value}
                  onClick={() => setCurrentTab(tab)}
                >
                  {tab.label}
                </TabTitleButton>
              ))}
            </TabTitles>
            <SidebarFooter>
              <SocialMedias>
                {socialMediaLogos.map(({ media, img }) => (
                  <SocialMedia key={media} src={img} onClick={() => openInWebBrowser(links[media])} />
                ))}
              </SocialMedias>
              <Version>v{import.meta.env.VITE_VERSION}</Version>
            </SidebarFooter>
          </TabTitlesColumnContent>
        </TabTitlesColumn>
        <TabContentsColumn>
          <ColumnHeader>
            <ColumnTitle>{currentTab.label}</ColumnTitle>
            <CloseButton aria-label={t`Close`} onClick={onClose}>
              <X />
            </CloseButton>
          </ColumnHeader>
          <Scrollbar translateContentSizeYToHolder>
            <ColumnContent>
              {
                {
                  general: <GeneralSettingsSection />,
                  wallets: <WalletsSettingsSection />,
                  network: <NetworkSettingsSection />,
                  devtools: <DevToolsSettingsSection />
                }[currentTab.value]
              }
            </ColumnContent>
          </Scrollbar>
        </TabContentsColumn>
      </CenteredBox>
    </ModalContainer>
  )
}

export default SettingsModal

const CenteredBox = styled(motion.div)`
  display: flex;

  position: relative;
  overflow: hidden;

  width: 85vw;
  max-width: 748px;
  height: 85vh;
  margin: auto;

  box-shadow: ${({ theme }) => theme.shadow.tertiary};
  border-radius: var(--radius-huge);
  background-color: ${({ theme }) => theme.bg.background1};
  border: 1px solid ${({ theme }) => theme.border.primary};
`

const Column = styled.div`
  display: flex;
  flex-direction: column;
`

const TabTitlesColumn = styled(Column)`
  flex: 1;
  border-right: 1px solid ${({ theme }) => theme.border.primary};
  background-color: ${({ theme }) => theme.bg.background2};
`
const TabContentsColumn = styled(Column)`
  flex: 2;
`

const CloseButton = styled.button`
  color: ${({ theme }) => theme.font.tertiary};
  cursor: pointer;
  transition: color 0.2s ease-out;
  padding: 0;
  display: flex;

  &:hover {
    color: ${({ theme }) => theme.font.primary};
  }
`

const ColumnHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid ${({ theme }) => theme.border.primary};
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const ColumnTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 16px;
  font-weight: var(--fontWeight-semiBold);
  color: ${({ theme }) => theme.font.primary};
`

const ColumnContent = styled.div`
  padding: 20px;

  // Special styling for settings modal
  // TODO: Create standalone components if used elesewhere?

  h2 {
    width: 100%;
    padding-bottom: 10px;
    margin-bottom: 15px;
    border-bottom: 1px solid ${({ theme }) => theme.border.secondary};
  }
`

const SidebarFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: var(--spacing-8);
`

const Version = styled.div`
  font-size: 11px;
  color: ${({ theme }) => theme.font.tertiary};
`

const SocialMedias = styled.div`
  display: flex;
  gap: 10px;
`

const SocialMedia = styled.div<{ src: string }>`
  ${({ src }) =>
    css`
      mask: url(${src}) no-repeat center;
    `}

  height: 20px;
  width: 20px;
  background-color: ${({ theme }) => theme.font.tertiary};

  &:hover {
    cursor: pointer;
    background-color: ${({ theme }) => theme.font.primary};
  }
`

const TabTitlesColumnContent = styled(ColumnContent)`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 20px 15px 10px;
  height: 100%;
`

const TabTitles = styled.div``

const TabTitlesColumnHeader = styled(ColumnHeader)`
  padding-left: 22px;
  padding-right: 22px;
`

const TabTitleButton = styled(Button)`
  height: 46px;
  justify-content: flex-start;

  &:first-child {
    margin-top: 0;
  }
`
