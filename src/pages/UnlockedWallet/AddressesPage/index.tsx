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

import { AnimatePresence, motion } from 'framer-motion'
import { Codesandbox, HardHat, Lightbulb, Search } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { useTheme } from 'styled-components'

import { fadeIn } from '@/animations'
import InfoMessage from '@/components/InfoMessage'
import InlineLabelValueInput from '@/components/Inputs/InlineLabelValueInput'
import Toggle from '@/components/Inputs/Toggle'
import Scrollbar from '@/components/Scrollbar'
import TabBar, { TabItem } from '@/components/TabBar'
import { useAddressesContext } from '@/contexts/addresses'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import useAddressDiscovery from '@/hooks/useAddressDiscovery'
import AddressSweepModal from '@/modals/AddressSweepModal'
import BottomModal from '@/modals/BottomModal'
import ModalPortal from '@/modals/ModalPortal'
import NewAddressModal from '@/modals/NewAddressModal'
import { addressesPageInfoMessageClosed } from '@/store/appSlice'
import { appHeaderHeightPx, walletSidebarWidthPx } from '@/style/globalStyles'
import { links } from '@/utils/links'
import { openInWebBrowser } from '@/utils/misc'

import { UnlockedWalletPanel } from '../UnlockedWalletLayout'
import AddressesTabContent from './AddressesTabContent'
import ContactsTabContent from './ContactsTabContent'
import OperationBox from './OperationBox'

const AddressesPage = () => {
  const { t } = useTranslation()
  const theme = useTheme()
  const dispatch = useAppDispatch()
  const { generateOneAddressPerGroup } = useAddressesContext()
  const [{ mnemonic, isPassphraseUsed }, infoMessageClosed] = useAppSelector((s) => [
    s.activeWallet,
    s.app.addressesPageInfoMessageClosed
  ])
  const discoverAndSaveActiveAddresses = useAddressDiscovery()

  const [isAdvancedSectionOpen, setIsAdvancedSectionOpen] = useState(false)
  const [isConsolidationModalOpen, setIsConsolidationModalOpen] = useState(false)
  const [isAddressesGenerationModalOpen, setIsAddressesGenerationModalOpen] = useState(false)

  const tabs = [
    { value: 'addresses', label: t`Addresses`, component: <AddressesTabContent /> },
    { value: 'contacts', label: t`Contacts`, component: <ContactsTabContent /> }
  ]
  const [currentTab, setCurrentTab] = useState<TabItem>(tabs[0])

  const handleOneAddressPerGroupClick = () => {
    if (isPassphraseUsed) {
      generateOneAddressPerGroup()
    } else {
      setIsAddressesGenerationModalOpen(true)
    }
  }

  const closeInfoMessage = () => dispatch(addressesPageInfoMessageClosed())

  if (!mnemonic) return null

  return (
    <ScreenHeight {...fadeIn}>
      <Scrollbar>
        <MainPanel>
          <Header>
            <div>
              <Title>{t`Addresses & contacts`}</Title>
              <Subtitle>{t`Easily organize your addresses and your contacts for a more serene transfer experience. Sync with the mobile wallet to be more organized on the go.`}</Subtitle>
            </div>
            <div>
              <AnimatePresence>
                {!infoMessageClosed && (
                  <InfoMessage link={links.faq} onClose={closeInfoMessage}>
                    {t`Want to know more? Click here to take a look at our FAQ!`}
                  </InfoMessage>
                )}
              </AnimatePresence>
            </div>
          </Header>
          <Tabs>
            <TabBar items={tabs} onTabChange={(tab) => setCurrentTab(tab)} activeTab={currentTab} />
            <TabContent>{tabs.find((t) => t.value === currentTab.value)?.component}</TabContent>
          </Tabs>
        </MainPanel>
      </Scrollbar>
      {currentTab.value === 'addresses' && (
        <AdvancedOperationsPanel>
          <AnimatePresence>
            {isAdvancedSectionOpen && (
              <BottomModalStyled
                onClose={() => setIsAdvancedSectionOpen(false)}
                label={t`Advanced operations`}
                // TODO: Is there a better way than passing a hardcoded height?
                contentHeight={344}
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
                    onButtonClick={() => discoverAndSaveActiveAddresses(mnemonic)}
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
    </ScreenHeight>
  )
}

export default AddressesPage

const advancedOperationsHeaderHeightPx = 80

const ScreenHeight = styled(motion.div)`
  height: calc(100vh - ${appHeaderHeightPx}px);
`

const MainPanel = styled(UnlockedWalletPanel)`
  padding-bottom: 130px;
`

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 40px;
  margin-top: 35px;
  margin-bottom: 50px;
`

const Title = styled.h1`
  font-size: 26px;
  font-weight: var(--fontWeight-semiBold);
  margin-top: 0;
  margin-bottom: 20px;
`

const Subtitle = styled.div`
  max-width: 394px;
  color: ${({ theme }) => theme.font.tertiary};
`

const AdvancedOperationsPanel = styled.div`
  position: absolute;
  bottom: 0;
  width: 100%;
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

const Tabs = styled.div``

const TabContent = styled.div`
  background-color: ${({ theme }) => theme.bg.secondary};
  border: 1px solid ${({ theme }) => theme.border.secondary};
  border-radius: var(--radius-big);

  padding: 30px 25px 45px 25px;
`
