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

import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'
import styled from 'styled-components'

import TabBar, { TabItem } from '@/components/TabBar'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import i18next from '@/i18n'
import AddressesTabContent from '@/pages/UnlockedWallet/AddressesPage/AddressesTabContent'
import ContactsTabContent from '@/pages/UnlockedWallet/AddressesPage/ContactsTabContent'
import { UnlockedWalletPanel } from '@/pages/UnlockedWallet/UnlockedWalletLayout'
import UnlockedWalletPage from '@/pages/UnlockedWallet/UnlockedWalletPage'
import { addressesPageInfoMessageClosed } from '@/storage/global/globalActions'
import { links } from '@/utils/links'

const tabs = [
  { value: 'addresses', label: `📭 ${i18next.t('Addresses')}` },
  { value: 'contacts', label: `🫂 ${i18next.t('Contacts')}` }
]

const AddressesPage = () => {
  const { t } = useTranslation()
  const { state } = useLocation()
  const dispatch = useAppDispatch()
  const tabsRowRef = useRef<HTMLDivElement>(null)

  const isInfoMessageClosed = useAppSelector((s) => s.global.addressesPageInfoMessageClosed)

  const [currentTab, setCurrentTab] = useState<TabItem>(tabs[state?.activeTab === 'contacts' ? 1 : 0])
  const [tabsRowHeight, setTabsRowHeight] = useState(0)

  const closeInfoMessage = () => dispatch(addressesPageInfoMessageClosed())

  useEffect(() => setTabsRowHeight(tabsRowRef.current?.clientHeight ?? 0), [])

  return (
    <UnlockedWalletPage
      title={t('Addresses & contacts')}
      subtitle={t(
        'Easily organize your addresses and your contacts for a more serene transfer experience. Sync with the mobile wallet to be more organized on the go.'
      )}
      isInfoMessageVisible={!isInfoMessageClosed}
      closeInfoMessage={closeInfoMessage}
      infoMessageLink={links.faq}
      infoMessage={t('Want to know more? Click here to take a look at our FAQ!')}
    >
      <TabBarPanel ref={tabsRowRef}>
        <TabBar items={tabs} onTabChange={(tab) => setCurrentTab(tab)} activeTab={currentTab} />
      </TabBarPanel>

      <TabContent>
        <TabPanel>
          {
            {
              addresses: <AddressesTabContent tabsRowHeight={tabsRowHeight} />,
              contacts: <ContactsTabContent />
            }[currentTab.value]
          }
        </TabPanel>
      </TabContent>
    </UnlockedWalletPage>
  )
}

export default AddressesPage

const TabContent = styled.div`
  padding-top: 30px;
  padding-bottom: 45px;
  border-radius: 0;
  border-left: none;
  border-right: none;
  border-bottom: none;
  flex: 1;
  background-color: ${({ theme }) => theme.bg.background1};
  border-top: 1px solid ${({ theme }) => theme.border.primary};
`

const TabPanel = styled(UnlockedWalletPanel)``

const TabBarPanel = styled(TabPanel)`
  z-index: 1;
  backdrop-filter: blur(10px);
`
