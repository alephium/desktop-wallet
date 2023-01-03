/*
Copyright 2018 - 2022 The Alephium Authors
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
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { PanelContentContainer, Section } from '@/components/PageComponents/PageContainers'
import TabBar, { TabItem } from '@/components/TabBar'
import CenteredModal from '@/modals/CenteredModal'
import GeneralSettingsSection from '@/modals/SettingsModal/GeneralSettingsSection'
import NetworkSettingsSection from '@/modals/SettingsModal/NetworkSettingsSection'
import WalletsSettingsSection from '@/modals/SettingsModal/WalletsSettingsSection'

const tabs = [
  { value: 'general', label: 'General', component: <GeneralSettingsSection /> },
  { value: 'client', label: 'Networks', component: <NetworkSettingsSection /> },
  { value: 'wallets', label: 'Wallets', component: <WalletsSettingsSection /> }
]

interface SettingsModalProps {
  onClose: () => void
}

const SettingsModal = ({ onClose }: SettingsModalProps) => {
  const { t } = useTranslation('App')
  const [currentTab, setCurrentTab] = useState<TabItem>(tabs[0])

  const tabsI18n = tabs.map((tab) => ({ ...tab, label: t(tab.label) }))

  return (
    <CenteredModal title={t`Settings`} onClose={onClose}>
      <PanelContentContainer>
        <TabBar tabItems={tabsI18n} onTabChange={(tab) => setCurrentTab(tab)} activeTab={currentTab} />
        {tabsI18n.find((t) => t.value === currentTab.value)?.component}
        <Section>
          <VersionNumber>
            {t`Version`}: {import.meta.env.VITE_VERSION}
          </VersionNumber>
        </Section>
      </PanelContentContainer>
    </CenteredModal>
  )
}

const VersionNumber = styled.span`
  color: ${({ theme }) => theme.font.secondary};
  margin-top: var(--spacing-3);
`

export default SettingsModal
