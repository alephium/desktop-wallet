import { useContext } from 'react'
import { GlobalContext } from '../../App'
import KeyValueInput from '../../components/Inputs/InlineLabelValueInput'
import { Input } from '../../components/Inputs/Input'
import ThemeSwitcher from '../../components/ThemeSwitcher'

const GeneralSettingsSection = () => {
  const {
    settings: {
      general: { walletLockTimeInMinutes }
    },
    updateSettings
  } = useContext(GlobalContext)

  return (
    <>
      <KeyValueInput
        label="Lock time"
        description="Duration in minutes after which the wallet will be locked automatically."
        InputComponent={
          <Input
            value={walletLockTimeInMinutes || ''}
            onChange={(v) =>
              updateSettings('general', { walletLockTimeInMinutes: v.target.value ? parseInt(v.target.value) : null })
            }
            placeholder={walletLockTimeInMinutes ? 'Minutes' : 'Off'}
            type="number"
            step={1}
            min={1}
          />
        }
      />
      <KeyValueInput
        label="Theme"
        description="Select the theme and please your eyes."
        InputComponent={<ThemeSwitcher />}
      />
    </>
  )
}

export default GeneralSettingsSection
