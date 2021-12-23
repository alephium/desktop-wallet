/*
Copyright 2018 - 2021 The Alephium Authors
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

import { useState } from 'react'
import styled from 'styled-components'

import { HorizontalDivider } from '../../components/PageComponents/HorizontalDivider'
import { PanelContentContainer, Section } from '../../components/PageComponents/PageContainers'
import TabBar, { TabItem } from '../../components/TabBar'
import ThemeSwitcher from '../../components/ThemeSwitcher'
import AccountsSettingsSection from './AccountsSettingsSection'
import NetworkSettingsSection from './NetworkSettingsSection'

const SettingsPage = () => {
  const tabs = [
    { value: 'client', label: 'Networks' },
    { value: 'accounts', label: 'Accounts' }
  ]

  const [currentTab, setCurrentTab] = useState<TabItem>(tabs[0])

  return (
    <PanelContentContainer>
      <TabBar tabItems={tabs} onTabChange={(tab) => setCurrentTab(tab)} activeTab={currentTab}></TabBar>
      {currentTab.value === 'accounts' ? (
        <AccountsSettingsSection />
      ) : currentTab.value === 'client' ? (
        <NetworkSettingsSection />
      ) : (
        <NetworkSettingsSection />
      )}
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
