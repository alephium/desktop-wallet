import { useState } from 'react'
import { Input } from '../../components/Inputs'
import KeyValueInput from '../../components/Inputs/InlineLabelValueInput'

const GeneralSettingsSection = () => {
  const [lockTime, setLockTime] = useState('')

  return (
    <>
      <KeyValueInput
        label="Lock time"
        onValueChange={setLockTime}
        InputComponent={<Input value={lockTime} onChange={(v) => setLockTime(v.target.value)} />}
      />
    </>
  )
}

export default GeneralSettingsSection
