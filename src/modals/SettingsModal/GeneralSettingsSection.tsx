/*
Copyright 2018 - 2023 The Alephium Authors
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

import { usePostHog } from 'posthog-js/react'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'

import Box from '@/components/Box'
import HorizontalDivider from '@/components/Dividers/HorizontalDivider'
import KeyValueInput from '@/components/Inputs/InlineLabelValueInput'
import Input from '@/components/Inputs/Input'
import Select from '@/components/Inputs/Select'
import Toggle from '@/components/Inputs/Toggle'
import PasswordConfirmation from '@/components/PasswordConfirmation'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import CenteredModal from '@/modals/CenteredModal'
import ModalPortal from '@/modals/ModalPortal'
import AnalyticsStorage from '@/storage/analytics/analyticsPersistentStorage'
import {
  analyticsToggled,
  discreetModeToggled,
  languageChanged,
  passwordRequirementToggled,
  walletLockTimeChanged
} from '@/storage/settings/settingsActions'
import { switchTheme } from '@/storage/settings/settingsStorageUtils'
import { Language, ThemeSettings } from '@/types/settings'
import { links } from '@/utils/links'
import { getAvailableLanguageOptions } from '@/utils/settings'

interface GeneralSettingsSectionProps {
  className?: string
}

const languageOptions = getAvailableLanguageOptions()

const themeOptions = [
  { label: 'System', value: 'system' as ThemeSettings },
  { label: 'Light', value: 'light' as ThemeSettings },
  { label: 'Dark', value: 'dark' as ThemeSettings }
]

const GeneralSettingsSection = ({ className }: GeneralSettingsSectionProps) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const isAuthenticated = useAppSelector((s) => !!s.activeWallet.mnemonic)
  const { walletLockTimeInMinutes, discreetMode, passwordRequirement, language, theme, analytics } = useAppSelector(
    (s) => s.settings
  )
  const posthog = usePostHog()

  const [isPasswordModelOpen, setIsPasswordModalOpen] = useState(false)

  const onPasswordRequirementChange = useCallback(() => {
    if (passwordRequirement) {
      setIsPasswordModalOpen(true)
    } else {
      dispatch(passwordRequirementToggled())

      posthog?.capture('Enabled password requirement')
    }
  }, [dispatch, passwordRequirement, posthog])

  const disablePasswordRequirement = useCallback(() => {
    dispatch(passwordRequirementToggled())
    setIsPasswordModalOpen(false)

    posthog?.capture('Disabled password requirement')
  }, [dispatch, posthog])

  const handleLanguageChange = (language: Language) => {
    dispatch(languageChanged(language))

    posthog?.capture('Changed language', { language })
  }

  const handleDiscreetModeToggle = () => dispatch(discreetModeToggled())

  const handleWalletLockTimeChange = (mins: string) => {
    const time = mins ? parseInt(mins) : null

    dispatch(walletLockTimeChanged(time))

    posthog?.capture('Changed wallet lock time', { time })
  }

  const handleThemeSelect = (theme: ThemeSettings) => {
    switchTheme(theme)

    posthog?.capture('Changed theme', { theme })
  }

  const handleAnalyticsToggle = (toggle: boolean) => {
    dispatch(analyticsToggled(toggle))

    if (toggle) {
      const id = AnalyticsStorage.load()
      posthog?.identify(id)
      posthog?.opt_in_capturing()
      posthog?.capture('Enabled analytics')
    } else {
      posthog?.capture('Disabled analytics')
      posthog?.opt_out_capturing()
    }
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
            heightSize="small"
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
            onSelect={handleThemeSelect}
            controlledValue={themeOptions.find((l) => l.value === theme)}
            noMargin
            title={t`Theme`}
            heightSize="small"
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
            onSelect={handleLanguageChange}
            controlledValue={languageOptions.find((l) => l.value === language)}
            noMargin
            title={t`Language`}
            heightSize="small"
          />
        }
      />
      <HorizontalDivider />
      <KeyValueInput
        label={t('Analytics')}
        description={t('Help us improve your experience!')}
        moreInfoLink={links.analytics}
        InputComponent={<Toggle toggled={analytics} onToggle={handleAnalyticsToggle} />}
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
