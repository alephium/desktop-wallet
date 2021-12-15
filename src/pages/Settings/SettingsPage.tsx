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

import { useContext, useState } from 'react'
import styled from 'styled-components'

import { GlobalContext } from '../../App'
import { HorizontalDivider, PanelContainer, SectionContent } from '../../components/PageComponents'
import TabBar, { TabItem } from '../../components/TabBar'
import ThemeSwitcher from '../../components/ThemeSwitcher'
import NetworkSettingsSection from './NetworkSettingsSection'
import AccountsSettingsSection from './AccountsSettingsSection'

const SettingsPage = () => {
  const { wallet } = useContext(GlobalContext)

  const tabs = [
    { value: 'accounts', label: 'Accounts' },
    { value: 'client', label: 'Networks' }
  ]

  const [currentTab, setCurrentTab] = useState<TabItem>(tabs[0])

  return (
    <PanelContainer>
      {wallet && <TabBar tabItems={tabs} onTabChange={(tab) => setCurrentTab(tab)} activeTab={currentTab}></TabBar>}
      {wallet && currentTab.value === 'accounts' ? (
        <AccountsSettingsSection />
      ) : currentTab.value === 'client' ? (
        <NetworkSettingsSection />
      ) : (
        <NetworkSettingsSection />
      )}
      <HorizontalDivider />
      <SectionContent>
        <ThemeSwitcher />
        <VersionNumber>Version: {process.env.REACT_APP_VERSION}</VersionNumber>
      </SectionContent>
    </PanelContainer>
  )
}

const VersionNumber = styled.span`
  color: ${({ theme }) => theme.font.secondary};
  margin-top: var(--spacing-3);
`

export default SettingsPage
