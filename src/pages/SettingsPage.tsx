import { useContext, useState } from 'react'
import { GlobalContext } from '../App'
import { Button } from '../components/Buttons'
import { Input } from '../components/Inputs'
import { ModalContext } from '../components/Modal'
import { PageContainer, SectionContent } from '../components/PageComponents'
import { loadSettingsOrDefault, saveSettings, Settings } from '../utils/clients'

const SettingsPage = () => {
  const currentSettings = loadSettingsOrDefault()
  const [settings, setSettings] = useState<Settings>({
    host: currentSettings.host,
    port: currentSettings.port,
    explorerApiHost: currentSettings.explorerApiHost,
    explorerApiPort: currentSettings.explorerApiPort,
    explorerUrl: currentSettings.explorerUrl
  })

  const { setSnackbarMessage } = useContext(GlobalContext)
  const { onClose } = useContext(ModalContext)

  const editSettings = (v: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...v }))
  }

  const handleSave = () => {
    saveSettings(settings)
    setSnackbarMessage({ text: 'Settings updated', type: 'success' })
  }

  return (
    <PageContainer>
      <SectionContent>
        <Input placeholder="Node host" value={settings.host} onChange={(e) => editSettings({ host: e.target.value })} />
        <Input
          placeholder="Node port"
          type="number"
          value={settings.port}
          onChange={(e) => editSettings({ port: parseInt(e.target.value) })}
        />
        <Input
          placeholder="Explorer API host"
          value={settings.explorerApiHost}
          onChange={(e) => editSettings({ explorerApiHost: e.target.value })}
        />
        <Input
          placeholder="Explorer API port"
          type="number"
          value={settings.explorerApiPort || ''}
          onChange={(e) => editSettings({ explorerApiPort: parseInt(e.target.value) })}
        />
        <Input
          placeholder="Explorer URL"
          value={settings.explorerUrl}
          onChange={(e) => editSettings({ explorerUrl: e.target.value })}
        />
      </SectionContent>

      <SectionContent>
        <Button secondary onClick={onClose}>
          Close
        </Button>
        <Button onClick={handleSave}>Save</Button>
      </SectionContent>
    </PageContainer>
  )
}

export default SettingsPage
