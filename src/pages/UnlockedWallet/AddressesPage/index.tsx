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
import { useLocation } from 'react-router-dom'
import styled from 'styled-components'

import Box from '@/components/Box'
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
  { value: 'addresses', label: i18next.t('Addresses') },
  { value: 'contacts', label: i18next.t('Contacts') }
]

const AddressesPage = () => {
  const { t } = useTranslation()
  const { state } = useLocation()
  const dispatch = useAppDispatch()

  const isInfoMessageClosed = useAppSelector((s) => s.global.addressesPageInfoMessageClosed)

  const [currentTab, setCurrentTab] = useState<TabItem>(tabs[state?.activeTab === 'contacts' ? 1 : 0])

  const closeInfoMessage = () => dispatch(addressesPageInfoMessageClosed())

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
      <Tabs>
        <TabPanel>
          <TabBar items={tabs} onTabChange={(tab) => setCurrentTab(tab)} activeTab={currentTab} />
        </TabPanel>
        <TabContent>
          <TabPanel>
            {
              {
                addresses: <AddressesTabContent />,
                contacts: <ContactsTabContent />
              }[currentTab.value]
            }
          </TabPanel>
        </TabContent>
      </Tabs>
    </UnlockedWalletPage>
  )
}

export default AddressesPage

const Tabs = styled.div`
  padding-bottom: 80px;
`

const TabContent = styled(Box)`
  padding-top: 30px;
  padding-bottom: 45px;
  border-radius: 0;
  border-left: none;
  border-right: none;
`

const TabPanel = styled(UnlockedWalletPanel)`
  padding-bottom: 0;
`
