import React, { ChangeEvent, useContext, useState } from 'react'
import { GlobalContext } from '../App'
import { Button } from '../components/Buttons'
import { InfoBox } from '../components/InfoBox'
import { Input } from '../components/Inputs'
import { PageContainer, SectionContent } from '../components/PageComponents'
import TabBar, { TabItem } from '../components/TabBar'
import { Settings } from '../utils/clients'
import { User } from 'lucide-react'
import Modal from '../components/Modal'
import { CenteredSecondaryParagraph } from '../components/Paragraph'
import { walletOpen, Storage, Wallet } from 'alf-client'

const tabs = [
  { value: 'account', label: 'Account' },
  { value: 'client', label: 'Client' }
]

const SettingsPage = () => {
  const [currentTab, setCurrentTab] = useState<TabItem>(tabs[0])
  const { wallet } = useContext(GlobalContext)

  return (
    <PageContainer>
      {wallet && <TabBar tabItems={tabs} onTabChange={(tab) => setCurrentTab(tab)} activeTab={currentTab}></TabBar>}
      {wallet && currentTab.value === 'account' ? (
        <AccountSettings />
      ) : currentTab.value === 'client' ? (
        <ClientSettings />
      ) : (
        <ClientSettings />
      )}
    </PageContainer>
  )
}

const AccountSettings = () => {
  const { currentUsername, networkType, setSnackbarMessage, setWallet } = useContext(GlobalContext)
  const [isDisplayingSecretModal, setIsDisplayingSecretModal] = useState(false)
  const [isDisplayingPhrase, setIsDisplayingPhrase] = useState(false)
  const [decriptedWallet, setDecriptedWallet] = useState<Wallet>()
  const [typedPassword, setTypedPassword] = useState('')

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTypedPassword(e.target.value)
  }

  const handlePasswordVerification = async () => {
    const walletEncrypted = Storage().load(currentUsername)

    try {
      const decryptedWallet = await walletOpen(typedPassword, walletEncrypted, networkType)

      if (decryptedWallet) {
        setDecriptedWallet(decryptedWallet)
        setIsDisplayingPhrase(true)
      }
    } catch (e) {
      setSnackbarMessage({ text: 'Invalid password', type: 'alert' })
    }
  }

  const handleLogout = () => {
    setWallet(undefined)
  }

  return (
    <div>
      <SectionContent>
        {isDisplayingSecretModal && (
          <Modal title="Secret phrase" onClose={() => setIsDisplayingSecretModal(false)}>
            {!isDisplayingPhrase ? (
              <div>
                <SectionContent>
                  <Input value={typedPassword} placeholder="Password" type="password" onChange={handlePasswordChange} />
                  <CenteredSecondaryParagraph>
                    Type your password above to show your 24 words phrase.
                  </CenteredSecondaryParagraph>
                </SectionContent>
                <SectionContent>
                  <Button onClick={handlePasswordVerification}>Show</Button>
                </SectionContent>
              </div>
            ) : (
              <SectionContent>{'Soon.'}</SectionContent>
            )}
          </Modal>
        )}

        <InfoBox text={`Current account: ${currentUsername}`} Icon={User} />
        {/*<Button secondary alert onClick={() => setIsDisplayingSecretModal(true)}>
          Show your secret phrase
            </Button>*/}
        <Button secondary alert onClick={handleLogout}>
          Disconnect
        </Button>
      </SectionContent>
    </div>
  )
}

const ClientSettings = () => {
  const { settings: currentSettings, setSettings } = useContext(GlobalContext)

  const [tempSettings, setTempSettings] = useState<Settings>({
    host: currentSettings.host,
    port: currentSettings.port,
    explorerApiHost: currentSettings.explorerApiHost,
    explorerApiPort: currentSettings.explorerApiPort,
    explorerUrl: currentSettings.explorerUrl
  })

  const editSettings = (v: Partial<Settings>) => {
    setTempSettings((prev) => ({ ...prev, ...v }))
  }

  const handleSave = () => {
    setSettings(tempSettings)
  }

  return (
    <div>
      <SectionContent>
        <Input
          placeholder="Node host"
          value={tempSettings.host}
          onChange={(e) => editSettings({ host: e.target.value })}
        />
        <Input
          placeholder="Node port"
          type="number"
          value={tempSettings.port}
          onChange={(e) => editSettings({ port: parseInt(e.target.value) })}
        />
        <Input
          placeholder="Explorer API host"
          value={tempSettings.explorerApiHost}
          onChange={(e) => editSettings({ explorerApiHost: e.target.value })}
        />
        <Input
          placeholder="Explorer API port"
          type="number"
          value={tempSettings.explorerApiPort || ''}
          onChange={(e) => editSettings({ explorerApiPort: parseInt(e.target.value) })}
        />
        <Input
          placeholder="Explorer URL"
          value={tempSettings.explorerUrl}
          onChange={(e) => editSettings({ explorerUrl: e.target.value })}
        />
      </SectionContent>

      <SectionContent>
        <Button onClick={handleSave}>Save</Button>
      </SectionContent>
    </div>
  )
}
export default SettingsPage
