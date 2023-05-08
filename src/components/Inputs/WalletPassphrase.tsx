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

import { useEffect, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import styled from 'styled-components'

import ActionLink from '@/components/ActionLink'
import InfoBox from '@/components/InfoBox'
import Input from '@/components/Inputs/Input'
import ToggleSection from '@/components/ToggleSection'
import { links } from '@/utils/links'
import { openInWebBrowser } from '@/utils/misc'

interface WalletPassphraseProps {
  onPassphraseConfirmed: (passphrase: string) => void
  setIsPassphraseConfirmed: (match: boolean) => void
  className?: string
}

const WalletPassphrase = ({ onPassphraseConfirmed, setIsPassphraseConfirmed, className }: WalletPassphraseProps) => {
  const { t } = useTranslation()
  const [isConsentActive, setIsConsentActive] = useState(false)
  const [value, setValue] = useState('')
  const [confirmValue, setConfirmValue] = useState('')
  const [isToggleSectionOpen, setIsToggleSectionOpen] = useState(false)

  const passphraseIsNotUsed = !value && !confirmValue
  const isPassphraseConfirmed = value === confirmValue && (isConsentActive || passphraseIsNotUsed)
  const showConfirmError = confirmValue.length >= value.length && value !== confirmValue

  useEffect(() => {
    setIsPassphraseConfirmed(isPassphraseConfirmed)
    if (isPassphraseConfirmed) onPassphraseConfirmed(confirmValue)
  }, [isPassphraseConfirmed, onPassphraseConfirmed, setIsPassphraseConfirmed, confirmValue])

  useEffect(() => {
    if (!value && !!confirmValue) setConfirmValue('')
  }, [confirmValue, value])

  const onExpandableSectionToggle = (isOpen: boolean) => {
    setIsToggleSectionOpen(isOpen)

    if (!isOpen) {
      if (value) setValue('')
      if (confirmValue) setConfirmValue('')
      if (isConsentActive) setIsConsentActive(false)
    }
  }

  return (
    <Container className={className} isOpen={isToggleSectionOpen}>
      <ToggleSection
        title={t('Use optional passphrase')}
        subtitle={t('Advanced feature')}
        onClick={onExpandableSectionToggle}
        shadow
      >
        <InfoBox importance="alert">
          <p>
            <Trans t={t} i18nKey="passphraseWarningMessage">
              <WarningEmphasis>This is an advanced feature!</WarningEmphasis>
              <br />
              Use it only if you know what you are doing.
              <br />
              Please, read our <ActionLink onClick={() => openInWebBrowser(links.passphrase)}>documentation</ActionLink>
              to learn about it.
            </Trans>
          </p>
        </InfoBox>
        <ConsentCheckbox>
          <input
            type="checkbox"
            id="passphrase-consent"
            checked={isConsentActive}
            onChange={() => setIsConsentActive(!isConsentActive)}
          />
          <label htmlFor="passphrase-consent">{t`I have read and understood the documentation`}</label>
        </ConsentCheckbox>
        <Input
          id="optional-passphrase"
          value={value}
          label={t`Optional passphrase`}
          type="password"
          onChange={(e) => setValue(e.target.value)}
          disabled={!isConsentActive}
        />
        <Input
          id="optional-passphrase-confirm"
          value={confirmValue}
          label={t`Confirm passphrase`}
          type="password"
          onChange={(e) => setConfirmValue(e.target.value)}
          disabled={!isConsentActive || !value}
          error={showConfirmError && t`Passphrases don't match`}
        />
      </ToggleSection>
    </Container>
  )
}

export default WalletPassphrase

const Container = styled.div<{ isOpen: boolean }>`
  max-width: 350px;

  opacity: ${({ isOpen }) => (isOpen ? 1 : 0.3)};
  transition: opacity 0.2s ease-out;

  &:hover {
    opacity: 1;
  }
`

const WarningEmphasis = styled.strong`
  color: ${({ theme }) => theme.global.alert};
`

const ConsentCheckbox = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 16px;
  text-align: left;
  justify-content: flex-start;
`
