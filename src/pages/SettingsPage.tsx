import { useContext, useState } from 'react'
import { GlobalContext } from '../App'
import { Button } from '../components/Buttons'
import { Input } from '../components/Inputs'
import { ModalContext } from '../components/Modal'
import { PageContainer, SectionContent } from '../components/PageComponents'
import { Settings } from '../utils/clients'

const SettingsPage = () => {
  const { settings: currentSettings, setSettings } = useContext(GlobalContext)

  const [tempSettings, setTempSettings] = useState<Settings>({
    host: currentSettings.host,
    port: currentSettings.port,
    explorerApiHost: currentSettings.explorerApiHost,
    explorerApiPort: currentSettings.explorerApiPort,
    explorerUrl: currentSettings.explorerUrl
  })

  const { onClose } = useContext(ModalContext)

  const editSettings = (v: Partial<Settings>) => {
    setTempSettings((prev) => ({ ...prev, ...v }))
  }

  const handleSave = () => {
    setSettings(tempSettings)
  }

  return (
    <PageContainer>
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
        <Button secondary onClick={onClose}>
          Close
        </Button>
        <Button onClick={handleSave}>Save</Button>
      </SectionContent>
    </PageContainer>
  )
}

export default SettingsPage
