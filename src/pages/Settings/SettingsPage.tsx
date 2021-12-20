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

import { useState } from 'react'
import styled from 'styled-components'

import { PanelContentContainer, Section } from '../../components/PageComponents/PageContainers'
import TabBar, { TabItem } from '../../components/TabBar'
import ThemeSwitcher from '../../components/ThemeSwitcher'
import NetworkSettingsSection from './NetworkSettingsSection'
import AccountsSettingsSection from './AccountsSettingsSection'
import { HorizontalDivider } from '../../components/PageComponents/HorizontalDivider'
import GeneralSettingsSection from './GeneralSettingsSection'

const tabs = [
  { value: 'general', label: 'General', component: <GeneralSettingsSection /> },
  { value: 'client', label: 'Networks', component: <NetworkSettingsSection /> },
  { value: 'accounts', label: 'Accounts', component: <AccountsSettingsSection /> }
]

const SettingsPage = () => {
  const [currentTab, setCurrentTab] = useState<TabItem>(tabs[0])

  return (
    <PanelContentContainer>
      <TabBar tabItems={tabs} onTabChange={(tab) => setCurrentTab(tab)} activeTab={currentTab}></TabBar>
      {tabs.find((t) => t.value === currentTab.value)?.component}
      <HorizontalDivider />
      <Section>
        <ThemeSwitcher />
        <VersionNumber>Version: {process.env.REACT_APP_VERSION}</VersionNumber>
      </Section>
    </PanelContentContainer>
  )
}

const VersionNumber = styled.span`
  color: ${({ theme }) => theme.font.secondary};
  margin-top: var(--spacing-3);
`

export default SettingsPage
