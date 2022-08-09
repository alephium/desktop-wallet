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

import { useEffect, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { links } from '../../utils/links'
import { openInWebBrowser } from '../../utils/misc'
import ActionLink from '../ActionLink'
import ExpandableSection from '../ExpandableSection'
import InfoBox from '../InfoBox'
import Input from './Input'

interface Props {
  onPassphraseConfirmed: (passphrase: string) => void
  setIsPassphraseConfirmed: (match: boolean) => void
  className?: string
}

const WalletPassphrase = ({ onPassphraseConfirmed, setIsPassphraseConfirmed, className }: Props) => {
  const { t } = useTranslation('App')
  const [isConsentActive, setIsConsentActive] = useState(false)
  const [value, setValue] = useState('')
  const [confirmValue, setConfirmValue] = useState('')

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

  return (
    <ExpandableSection
      sectionTitleClosed={t`Optional passphrase (advanced)`}
      centered
      shrinkWhenOpen
      className={className}
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
        value={value}
        label={t`Optional passphrase`}
        type="password"
        onChange={(e) => setValue(e.target.value)}
        disabled={!isConsentActive}
      />
      <Input
        value={confirmValue}
        label={t`Confirm passphrase`}
        type="password"
        onChange={(e) => setConfirmValue(e.target.value)}
        disabled={!isConsentActive || !value}
        error={showConfirmError && t`Passphrases don't match`}
      />
    </ExpandableSection>
  )
}

const WarningEmphasis = styled.strong`
  color: ${({ theme }) => theme.global.alert};
`

const ConsentCheckbox = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 16px;
`

export default styled(WalletPassphrase)`
  max-width: 400px;
`
