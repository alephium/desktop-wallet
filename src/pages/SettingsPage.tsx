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

import { ChangeEvent, useCallback, useContext, useState } from 'react'
import { AlertTriangle, Edit3 } from 'lucide-react'
import { walletOpen, getStorage, Wallet } from 'alephium-js'
import styled, { useTheme } from 'styled-components'

import { GlobalContext } from '../App'
import { Button } from '../components/Buttons'
import { InfoBox } from '../components/InfoBox'
import { Input, Select } from '../components/Inputs'
import { PanelContainer, SectionContent } from '../components/PageComponents'
import TabBar, { TabItem } from '../components/TabBar'
import Modal from '../components/Modal'
import { CenteredSecondaryParagraph } from '../components/Paragraph'
import ThemeSwitcher from '../components/ThemeSwitcher'
import ExpandableSection from '../components/ExpandableSection'
import { getNetworkName, networkEndpoints, NetworkType, Settings } from '../utils/settings'
import { useMountEffect } from '../utils/hooks'

const Storage = getStorage()

const SettingsPage = () => {
  const { wallet, currentUsername } = useContext(GlobalContext)

  const tabs = [
    { value: 'account', label: `Account (${currentUsername})` },
    { value: 'client', label: 'Networks' }
  ]

  const [currentTab, setCurrentTab] = useState<TabItem>(tabs[0])

  return (
    <PanelContainer>
      {wallet && <TabBar tabItems={tabs} onTabChange={(tab) => setCurrentTab(tab)} activeTab={currentTab}></TabBar>}
      {wallet && currentTab.value === 'account' ? (
        <AccountSettings />
      ) : currentTab.value === 'client' ? (
        <ClientSettings />
      ) : (
        <ClientSettings />
      )}
      <Divider />
      <SectionContent>
        <ThemeSwitcher />
        <VersionNumber>Version: {process.env.REACT_APP_VERSION}</VersionNumber>
      </SectionContent>
    </PanelContainer>
  )
}

// ================
// Account settings
// ================

const AccountSettings = () => {
  const { currentUsername, setSnackbarMessage, setWallet } = useContext(GlobalContext)
  const [isDisplayingSecretModal, setIsDisplayingSecretModal] = useState(false)
  const [isDisplayingRemoveModal, setIsDisplayingRemoveModal] = useState(false)
  const [isDisplayingPhrase, setIsDisplayingPhrase] = useState(false)
  const [decryptedWallet, setDecryptedWallet] = useState<Wallet>()
  const [typedPassword, setTypedPassword] = useState('')
  const theme = useTheme()

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTypedPassword(e.target.value)
  }

  const handlePasswordVerification = async (callback: () => void) => {
    const walletEncrypted = Storage.load(currentUsername)

    try {
      const plainWallet = await walletOpen(typedPassword, walletEncrypted)

      if (plainWallet) {
        setDecryptedWallet(plainWallet)
        callback()
      }
    } catch (e) {
      setSnackbarMessage({ text: 'Invalid password', type: 'alert' })
    }
  }

  const openSecretPhraseModal = () => {
    setTypedPassword('')
    setIsDisplayingSecretModal(true)
  }

  const openRemoveAccountModal = () => {
    setTypedPassword('')
    setIsDisplayingRemoveModal(true)
  }

  const handleLogout = () => {
    setWallet(undefined)
  }

  const handleRemoveAccount = () => {
    Storage.remove(currentUsername)
    handleLogout()
  }

  return (
    <>
      <SectionContent>
        {isDisplayingSecretModal && (
          <Modal title="Secret phrase" onClose={() => setIsDisplayingSecretModal(false)} focusMode>
            {!isDisplayingPhrase ? (
              <div>
                <SectionContent>
                  <Input value={typedPassword} placeholder="Password" type="password" onChange={handlePasswordChange} />
                  <CenteredSecondaryParagraph>
                    Type your password above to show your 24 words phrase.
                  </CenteredSecondaryParagraph>
                </SectionContent>
                <SectionContent>
                  <Button onClick={() => handlePasswordVerification(() => setIsDisplayingPhrase(true))}>Show</Button>
                </SectionContent>
              </div>
            ) : (
              <SectionContent>
                <InfoBox
                  text={'Carefully note the 24 words. They are the keys to your wallet.'}
                  Icon={Edit3}
                  importance="alert"
                />
                <PhraseBox>{decryptedWallet?.mnemonic || 'No mnemonic was stored along with this wallet'}</PhraseBox>
              </SectionContent>
            )}
          </Modal>
        )}

        {isDisplayingRemoveModal && (
          <Modal title="Remove account" onClose={() => setIsDisplayingRemoveModal(false)} focusMode>
            <SectionContent>
              <AlertTriangle size={60} color={theme.global.alert} style={{ marginBottom: 35 }} />
            </SectionContent>
            <SectionContent>
              <InfoBox
                importance="alert"
                text="Please make sure to have your secret phrase saved and stored somewhere secure to restore your wallet in the future. Without the 24 words, your wallet will be unrecoverable and permanently lost."
              />

              <CenteredSecondaryParagraph>
                <b>Not your keys, not your coins.</b>
              </CenteredSecondaryParagraph>
            </SectionContent>
            <SectionContent inList>
              <Button alert onClick={() => handleRemoveAccount()}>
                CONFIRM REMOVAL
              </Button>
            </SectionContent>
          </Modal>
        )}

        <Button secondary alert onClick={openSecretPhraseModal}>
          Show your secret phrase
        </Button>
        <Button secondary onClick={handleLogout}>
          Lock wallet
        </Button>
        <Divider />
        <Button alert onClick={openRemoveAccountModal}>
          Remove account
        </Button>
      </SectionContent>
    </>
  )
}

// ================
// Network settings
// ================

interface NetworkSelectOption {
  label: string
  value: NetworkType
}

const ClientSettings = () => {
  const { settings: currentSettings, setSettings, setSnackbarMessage } = useContext(GlobalContext)

  const [tempSettings, setTempSettings] = useState<Settings>({
    nodeHost: currentSettings.nodeHost,
    explorerApiHost: currentSettings.explorerApiHost,
    explorerUrl: currentSettings.explorerUrl
  })

  const [selectedNetwork, setSelectedNetwork] = useState<NetworkType>()

  const [advancedSectionOpen, setAdvancedSectionOpen] = useState(false)

  const networkSelectOptions: NetworkSelectOption[] = [
    { label: 'Mainnet', value: 'mainnet' },
    { label: 'Testnet', value: 'testnet' },
    { label: 'Localhost', value: 'localhost' },
    { label: 'Custom', value: 'custom' }
  ]

  const overrideSelectionIfMatchesPreset = useCallback((newSettings: Settings) => {
    // Check if values correspond to an existing preset
    const newNetwork = getNetworkName(newSettings)

    setSelectedNetwork(newNetwork)
  }, [])

  const editSettings = (v: Partial<Settings>) => {
    const newSettings = { ...tempSettings, ...v }

    // Check if we need to append the http:// protocol if an IP or localhost is used
    if (v.nodeHost?.match(/^(?:(?:[0-9]{1,3}\.){3}[0-9]{1,3}|localhost)(?::[0-9]*)?$/)) {
      newSettings.nodeHost = `http://${v.nodeHost}`
    }

    overrideSelectionIfMatchesPreset(newSettings)

    setTempSettings(newSettings)
  }

  const handleNetworkPresetChange = useCallback((option: typeof networkSelectOptions[number] | undefined) => {
    if (option) {
      setSelectedNetwork(option.value)

      if (option.value === 'custom') {
        // Make sure to open expandable advanced section
        setAdvancedSectionOpen(true)
      } else {
        setTempSettings(networkEndpoints[option.value])
      }
    }
  }, [])

  const handleSave = () => {
    overrideSelectionIfMatchesPreset(tempSettings)
    setSettings(tempSettings)
    setSnackbarMessage({ text: 'Settings saved!', type: 'info' })
  }

  // Set existing value on mount
  useMountEffect(() => {
    overrideSelectionIfMatchesPreset(currentSettings)
  })

  return (
    <>
      <Select
        options={networkSelectOptions}
        onValueChange={handleNetworkPresetChange}
        controlledValue={networkSelectOptions.find((n) => n.value === selectedNetwork)}
        title="Network"
        placeholder="Network"
      />
      <ExpandableSection
        sectionTitle="Advanced settings"
        open={advancedSectionOpen}
        onOpenChange={(isOpen) => setAdvancedSectionOpen(isOpen)}
      >
        <UrlInputs>
          <Input
            placeholder="Node host"
            value={tempSettings.nodeHost}
            onChange={(e) => editSettings({ nodeHost: e.target.value })}
          />
          <Input
            placeholder="Explorer API host"
            value={tempSettings.explorerApiHost}
            onChange={(e) => editSettings({ explorerApiHost: e.target.value })}
          />
          <Input
            placeholder="Explorer URL"
            value={tempSettings.explorerUrl}
            onChange={(e) => editSettings({ explorerUrl: e.target.value })}
          />
        </UrlInputs>
      </ExpandableSection>
      <SectionContent inList>
        <Button onClick={handleSave}>Save</Button>
      </SectionContent>
    </>
  )
}

const PhraseBox = styled.div`
  width: 100%;
  padding: 20px;
  color: ${({ theme }) => theme.font.contrastPrimary};
  font-weight: 600;
  background-color: ${({ theme }) => theme.global.alert};
  border-radius: 14px;
  margin-bottom: 20px;
`

const UrlInputs = styled.div`
  display: flex;
  flex-direction: column;
`

const Divider = styled.div`
  background-color: ${({ theme }) => theme.border.secondary};
  margin: 15px 5px;
  height: 1px;
  width: 100%;
`

const VersionNumber = styled.span`
  color: ${({ theme }) => theme.font.secondary};
  margin-top: 15px;
`

export default SettingsPage
