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

import KeyValueInput from '../../components/Inputs/InlineLabelValueInput'
import Input from '../../components/Inputs/Input'
import Toggle from '../../components/Inputs/Toggle'
import ThemeSwitcher from '../../components/ThemeSwitcher'
import { useGlobalContext } from '../../contexts/global'

const GeneralSettingsSection = () => {
  const {
    settings: {
      general: { walletLockTimeInMinutes, discreetMode }
    },
    updateSettings
  } = useGlobalContext()

  return (
    <>
      <KeyValueInput
        label="Lock time"
        description="Duration in minutes after which an idle wallet will lock automatically."
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
        InputComponent={<ThemeSwitcher small />}
      />
      <KeyValueInput
        label="Theme"
        description="Toggle discreet mode (hide amounts)."
        InputComponent={
          <Toggle
            small
            toggled={discreetMode}
            onToggle={() => updateSettings('general', { discreetMode: !discreetMode })}
          />
        }
      />
    </>
  )
}

export default GeneralSettingsSection
