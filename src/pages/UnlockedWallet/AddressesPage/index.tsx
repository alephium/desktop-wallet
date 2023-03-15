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

import { AnimatePresence } from 'framer-motion'
import { Codesandbox, HardHat, Lightbulb, Search } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'
import styled, { useTheme } from 'styled-components'

import Box from '@/components/Box'
import InlineLabelValueInput from '@/components/Inputs/InlineLabelValueInput'
import Toggle from '@/components/Inputs/Toggle'
import TabBar, { TabItem } from '@/components/TabBar'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import useAddressGeneration from '@/hooks/useAddressGeneration'
import i18next from '@/i18n'
import AddressSweepModal from '@/modals/AddressSweepModal'
import BottomModal from '@/modals/BottomModal'
import ModalPortal from '@/modals/ModalPortal'
import NewAddressModal from '@/modals/NewAddressModal'
import AddressesTabContent from '@/pages/UnlockedWallet/AddressesPage/AddressesTabContent'
import ContactsTabContent from '@/pages/UnlockedWallet/AddressesPage/ContactsTabContent'
import OperationBox from '@/pages/UnlockedWallet/AddressesPage/OperationBox'
import { UnlockedWalletPanel } from '@/pages/UnlockedWallet/UnlockedWalletLayout'
import UnlockedWalletPage from '@/pages/UnlockedWallet/UnlockedWalletPage'
import { addressesPageInfoMessageClosed } from '@/storage/global/globalActions'
import { walletSidebarWidthPx } from '@/style/globalStyles'
import { links } from '@/utils/links'
import { openInWebBrowser } from '@/utils/misc'

const tabs = [
  { value: 'addresses', label: i18next.t('Addresses') },
  { value: 'contacts', label: i18next.t('Contacts') }
]

const AddressesPage = () => {
  const { t } = useTranslation()
  const { state } = useLocation()
  const theme = useTheme()
  const dispatch = useAppDispatch()
  const { generateAndSaveOneAddressPerGroup, discoverAndSaveUsedAddresses } = useAddressGeneration()
  const [{ mnemonic, isPassphraseUsed, name: walletName }, infoMessageClosed] = useAppSelector((s) => [
    s.activeWallet,
    s.global.addressesPageInfoMessageClosed
  ])

  const [isAdvancedSectionOpen, setIsAdvancedSectionOpen] = useState(false)
  const [isConsolidationModalOpen, setIsConsolidationModalOpen] = useState(false)
  const [isAddressesGenerationModalOpen, setIsAddressesGenerationModalOpen] = useState(false)
  const [currentTab, setCurrentTab] = useState<TabItem>(tabs[state?.activeTab === 'contacts' ? 1 : 0])

  const handleOneAddressPerGroupClick = () => {
    if (isPassphraseUsed) {
      generateAndSaveOneAddressPerGroup()
    } else {
      setIsAddressesGenerationModalOpen(true)
    }
  }

  const closeInfoMessage = () => dispatch(addressesPageInfoMessageClosed())

  if (!mnemonic || !walletName) return null

  return (
    <UnlockedWalletPage
      title={t('Addresses & contacts')}
      subtitle={t(
        'Easily organize your addresses and your contacts for a more serene transfer experience. Sync with the mobile wallet to be more organized on the go.'
      )}
      isInfoMessageVisible={!infoMessageClosed}
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
      {currentTab.value === 'addresses' && (
        <AdvancedOperationsPanel>
          <AnimatePresence>
            {isAdvancedSectionOpen && (
              <BottomModalStyled
                onClose={() => setIsAdvancedSectionOpen(false)}
                label={t`Advanced operations`}
                // TODO: Is there a better way than passing a hardcoded height?
                contentHeight={350}
              >
                <AdvancedOperations>
                  <OperationBox
                    title={t`Consolidate UTXOs`}
                    Icon={<Codesandbox color="#64f6c2" strokeWidth={1} size={46} />}
                    description={t`Consolidate (merge) your UTXOs into one.`}
                    buttonText={t`Start`}
                    onButtonClick={() => setIsConsolidationModalOpen(true)}
                    infoLink={links.utxoConsolidation}
                  />
                  <OperationBox
                    title={t`Generate one address per group`}
                    Icon={<HardHat color="#a880ff" strokeWidth={1} size={55} />}
                    description={t`Useful for miners or DeFi use.`}
                    buttonText={isPassphraseUsed ? t`Generate` : t`Start`}
                    onButtonClick={handleOneAddressPerGroupClick}
                    infoLink={links.miningWallet}
                  />
                  <OperationBox
                    title={t`Discover active addresses`}
                    Icon={<Search color={theme.global.complementary} strokeWidth={1} size={55} />}
                    description={t`Scan the blockchain for addresses you used in the past.`}
                    buttonText={t`Search`}
                    onButtonClick={discoverAndSaveUsedAddresses}
                    infoLink={links.miningWallet}
                  />
                  <OperationBox
                    placeholder
                    title={t`More to come...`}
                    Icon={<Lightbulb color={theme.font.secondary} strokeWidth={1} size={28} />}
                    description={t`You have great ideas you want to share?`}
                    buttonText={t`Tell us!`}
                    onButtonClick={() => openInWebBrowser(links.discord)}
                  />
                </AdvancedOperations>
              </BottomModalStyled>
            )}
          </AnimatePresence>
          <AdvancedOperationsHeader>
            <AdvancedOperationsTitle>{t`Advanced operations`}</AdvancedOperationsTitle>
            <AdvancedOperationsToggle
              label={t`Show advanced operations`}
              description={t`Open the advanced feature panel.`}
              InputComponent={
                <Toggle
                  label={t`Show advanced operations`}
                  toggled={isAdvancedSectionOpen}
                  onToggle={() => setIsAdvancedSectionOpen(!isAdvancedSectionOpen)}
                />
              }
            />
          </AdvancedOperationsHeader>
        </AdvancedOperationsPanel>
      )}
      <ModalPortal>
        {isConsolidationModalOpen && <AddressSweepModal onClose={() => setIsConsolidationModalOpen(false)} />}
        {isAddressesGenerationModalOpen && (
          <NewAddressModal
            title={t`Generate one address per group`}
            onClose={() => setIsAddressesGenerationModalOpen(false)}
          />
        )}
      </ModalPortal>
    </UnlockedWalletPage>
  )
}

export default AddressesPage

const advancedOperationsHeaderHeightPx = 80

const AdvancedOperationsPanel = styled.div`
  position: fixed;
  bottom: 0;
  right: 0;
  left: ${walletSidebarWidthPx}px;
  background-color: ${({ theme }) => theme.bg.background1};
`

const BottomModalStyled = styled(BottomModal)`
  left: ${walletSidebarWidthPx}px;
  bottom: ${advancedOperationsHeaderHeightPx}px;
`

const AdvancedOperations = styled(UnlockedWalletPanel)`
  background-color: ${({ theme }) => theme.bg.background1};

  padding-top: 26px;
  padding-bottom: 26px;
  display: flex;
  flex-wrap: wrap;
  gap: 30px;
`

const AdvancedOperationsHeader = styled(UnlockedWalletPanel)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: ${advancedOperationsHeaderHeightPx}px;
  border-top: 1px solid ${({ theme }) => theme.border.secondary};
  background-color: ${({ theme }) => theme.bg.background1};
  position: relative;
  z-index: 1;
  padding-bottom: 0;
`

const AdvancedOperationsTitle = styled.h2`
  margin: 0;
  color: ${({ theme }) => theme.font.tertiary};
  font-size: 16px;
  font-weight: var(--fontWeight-medium);
`
const AdvancedOperationsToggle = styled(InlineLabelValueInput)`
  width: 370px;
  padding: 0;
`

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
