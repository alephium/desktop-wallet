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

import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'

import Box from '@/components/Box'
import KeyValueInput from '@/components/Inputs/InlineLabelValueInput'
import Input from '@/components/Inputs/Input'
import Select from '@/components/Inputs/Select'
import Toggle from '@/components/Inputs/Toggle'
import HorizontalDivider from '@/components/PageComponents/HorizontalDivider'
import PasswordConfirmation from '@/components/PasswordConfirmation'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import useSwitchTheme from '@/hooks/useSwitchTheme'
import CenteredModal from '@/modals/CenteredModal'
import { Language, ThemeType } from '@/types/settings'

import ModalPortal from '../ModalPortal'
import { passwordRequirementToggled, walletLockTimeChanged } from '@/store/settingsSlice'
import { languageChanged } from '@/store/actions'

interface GeneralSettingsSectionProps {
  className?: string
}

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

const GeneralSettingsSection = ({ className }: GeneralSettingsSectionProps) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const switchTheme = useSwitchTheme()
  const [isAuthenticated, { walletLockTimeInMinutes, discreetMode, passwordRequirement, language, theme }] =
    useAppSelector((s) => [!!s.activeWallet.mnemonic, s.settings.general])

  const [isPasswordModelOpen, setIsPasswordModalOpen] = useState(false)

  const onPasswordRequirementChange = useCallback(() => {
    if (passwordRequirement) {
      setIsPasswordModalOpen(true)
    } else {
      dispatch(passwordRequirementToggled())
    }
  }, [dispatch, passwordRequirement])

  const disablePasswordRequirement = useCallback(() => {
    dispatch(passwordRequirementToggled())
    setIsPasswordModalOpen(false)
  }, [dispatch])

  const handleLanguageChange = (language: Language) => dispatch(languageChanged(language))

  const handleDiscreetModeToggle = () => dispatch(discreetModeToggled())

  const handleWalletLockTimeChange = (mins: string) => {
    const time = mins ? parseInt(mins) : null

    dispatch(walletLockTimeChanged(time))
  }

  const discreetModeText = t`Discreet mode`

  return (
    <Box className={className}>
      <KeyValueInput
        label={t`Lock time`}
        description={t`Duration in minutes after which an idle wallet will lock automatically.`}
        InputComponent={
          <Input
            id="wallet-lock-time-in-minutes"
            value={walletLockTimeInMinutes || ''}
            onChange={(v) => handleWalletLockTimeChange(v.target.value)}
            label={walletLockTimeInMinutes ? t`Minutes` : t`Off`}
            type="number"
            step={1}
            min={1}
            noMargin
          />
        }
      />
      <HorizontalDivider />
      <KeyValueInput
        label={t`Theme`}
        description={t`Select the theme and please your eyes.`}
        InputComponent={
          <Select
            id="theme"
            options={themeOptions}
            onValueChange={(v) => v?.value && switchTheme(v.value)}
            controlledValue={themeOptions.find((l) => l.value === theme)}
            noMargin
            title={t`Theme`}
          />
        }
      />
      <HorizontalDivider />
      <KeyValueInput
        label={discreetModeText}
        description={t`Toggle discreet mode (hide amounts).`}
        InputComponent={<Toggle label={discreetModeText} toggled={discreetMode} onToggle={handleDiscreetModeToggle} />}
      />
      <HorizontalDivider />
      {isAuthenticated && (
        <>
          <KeyValueInput
            label={t`Password requirement`}
            description={t`Require password confirmation before sending each transaction.`}
            InputComponent={<Toggle toggled={passwordRequirement} onToggle={onPasswordRequirementChange} />}
          />
          <HorizontalDivider />
        </>
      )}
      <KeyValueInput
        label={t`Language`}
        description={t`Change the wallet language`}
        InputComponent={
          <Select
            id="language"
            options={languageOptions}
            onValueChange={(v) => v?.value && handleLanguageChange(v.value)}
            controlledValue={languageOptions.find((l) => l.value === language)}
            noMargin
            title={t`Language`}
          />
        }
      />
      <ModalPortal>
        {isPasswordModelOpen && (
          <CenteredModal title={t`Password`} onClose={() => setIsPasswordModalOpen(false)} focusMode>
            <PasswordConfirmation
              text={t`Type your password to change this setting.`}
              buttonText={t`Enter`}
              onCorrectPasswordEntered={disablePasswordRequirement}
            />
          </CenteredModal>
        )}
      </ModalPortal>
    </Box>
  )
}

export default GeneralSettingsSection
