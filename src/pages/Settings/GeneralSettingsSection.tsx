import { useState } from 'react'
import KeyValueInput from '../../components/Inputs/InlineLabelValueInput'
import { Input } from '../../components/Inputs/Input'

const GeneralSettingsSection = () => {
  const [lockTime, setLockTime] = useState('')

  return (
    <>
      <KeyValueInput
        label="Lock time"
        description="Duration in seconds after which the wallet will be locked automatically."
        onValueChange={setLockTime}
        InputComponent={<Input value={lockTime} onChange={(v) => setLockTime(v.target.value)} placeholder="Seconds" />}
      />
    </>
  )
}

export default GeneralSettingsSection
