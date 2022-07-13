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

import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import styled from 'styled-components'

import ExpandableSection from '../ExpandableSection'
import InfoBox from '../InfoBox'
import PassphraseLink from '../PassphraseLink'
import Input from './Input'

interface Props {
  value: string
  onChange: (passphrase: string) => void
  className?: string
}

const WalletPassphrase = ({ value, onChange, className }: Props) => {
  const { t } = useTranslation('App')
  const [isConsentActive, setIsConsentActive] = useState(false)

  return (
    <ExpandableSection sectionTitleClosed={t`Optional passphrase (advanced)`} centered className={className}>
      <InfoBox importance="alert">
        <p>
          <Trans t={t} i18nKey="passphraseWarningMessage">
            <WarningEmphasis>This is an advanced feature!</WarningEmphasis>
            <br />
            Use it only if you know what you are doing.
            <br />
            Please, read our <PassphraseLink>documentation</PassphraseLink> to learn about it.
          </Trans>
        </p>
      </InfoBox>
      <ConsentCheckbox>
        <input
          type="checkbox"
          id="passphrase-consent"
          checked={isConsentActive}
          onClick={() => setIsConsentActive(!isConsentActive)}
        />
        <label htmlFor="passphrase-consent">{t`I have read and understood the documentation`}</label>
      </ConsentCheckbox>
      <Input
        value={value}
        label={t`Optional passphrase`}
        type="password"
        onChange={(e) => onChange(e.target.value)}
        disabled={!isConsentActive}
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
`

export default styled(WalletPassphrase)`
  max-width: 400px;
`
