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
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'

import KeyValueInput from '../../components/Inputs/InlineLabelValueInput'
import Input from '../../components/Inputs/Input'
import Select from '../../components/Inputs/Select'
import Toggle from '../../components/Inputs/Toggle'
import HorizontalDivider from '../../components/PageComponents/HorizontalDivider'
import PasswordConfirmation from '../../components/PasswordConfirmation'
import { useGlobalContext } from '../../contexts/global'
import useSwitchTheme from '../../hooks/useSwitchTheme'
import { Language, ThemeType } from '../../types/settings'
import { loadSettings } from '../../utils/settings'
import CenteredModal from '../CenteredModal'

const languageOptions = [
  { label: 'English', value: 'en-US' as Language },
  { label: 'Français', value: 'fr-FR' as Language },
  { label: 'Tiếng Việt', value: 'vi-VN' as Language },
  { label: 'Deutsch', value: 'de-DE' as Language }
]

const themeOptions = [
  { label: 'System', value: 'system' as ThemeType },
  { label: 'Light', value: 'light' as ThemeType },
  { label: 'Dark', value: 'dark' as ThemeType }
]

const GeneralSettingsSection = () => {
  const { t } = useTranslation('App')
  const switchTheme = useSwitchTheme()
  const {
    settings: {
      general: { walletLockTimeInMinutes, discreetMode, passwordRequirement, language }
    },
    updateSettings,
    wallet
  } = useGlobalContext()

  const storedSettings = loadSettings()

  const [isPasswordModelOpen, setIsPasswordModalOpen] = useState(false)

  const onPasswordRequirementChange = useCallback(() => {
    if (passwordRequirement) {
      setIsPasswordModalOpen(true)
    } else {
      updateSettings('general', { passwordRequirement: true })
    }
  }, [passwordRequirement, updateSettings])

  const disablePasswordRequirement = useCallback(() => {
    updateSettings('general', { passwordRequirement: false })
    setIsPasswordModalOpen(false)
  }, [updateSettings])

  const onLanguageChange = (language: Language) => updateSettings('general', { language })

  const discreetModeText = t`Discreet mode`

  return (
    <>
      <KeyValueInput
        label={t`Lock time`}
        description={t`Duration in minutes after which an idle wallet will lock automatically.`}
        InputComponent={
          <Input
            id="wallet-lock-time-in-minutes"
            value={walletLockTimeInMinutes || ''}
            onChange={(v) =>
              updateSettings('general', { walletLockTimeInMinutes: v.target.value ? parseInt(v.target.value) : null })
            }
            label={walletLockTimeInMinutes ? t`Minutes` : t`Off`}
            type="number"
            step={1}
            min={1}
            noMargin
          />
        }
      />
      <HorizontalDivider narrow />
      <KeyValueInput
        label={t`Theme`}
        description={t`Select the theme and please your eyes.`}
        InputComponent={
          <Select
            id="theme"
            options={themeOptions}
            onValueChange={(v) => v?.value && switchTheme(v.value)}
            controlledValue={themeOptions.find((l) => l.value === storedSettings.general.theme)}
            noMargin
            title={t`Theme`}
          />
        }
      />
      <HorizontalDivider narrow />
      <KeyValueInput
        label={discreetModeText}
        description={t`Toggle discreet mode (hide amounts).`}
        InputComponent={
          <Toggle
            label={discreetModeText}
            toggled={discreetMode}
            onToggle={() => updateSettings('general', { discreetMode: !discreetMode })}
          />
        }
      />
      <HorizontalDivider narrow />
      {wallet && (
        <>
          <KeyValueInput
            label={t`Password requirement`}
            description={t`Require password confirmation before sending each transaction.`}
            InputComponent={<Toggle toggled={passwordRequirement} onToggle={onPasswordRequirementChange} />}
          />
          <HorizontalDivider narrow />
        </>
      )}
      <KeyValueInput
        label={t`Language`}
        description={t`Change the wallet language`}
        InputComponent={
          <Select
            id="language"
            options={languageOptions}
            onValueChange={(v) => v?.value && onLanguageChange(v.value)}
            controlledValue={languageOptions.find((l) => l.value === language)}
            noMargin
            title={t`Language`}
          />
        }
      />
      <AnimatePresence>
        {isPasswordModelOpen && (
          <CenteredModal title={t`Password`} onClose={() => setIsPasswordModalOpen(false)} focusMode narrow>
            <PasswordConfirmation
              text={t`Type your password to change this setting.`}
              buttonText={t`Enter`}
              onCorrectPasswordEntered={disablePasswordRequirement}
            />
          </CenteredModal>
        )}
      </AnimatePresence>
    </>
  )
}

export default GeneralSettingsSection
