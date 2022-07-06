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

import styled from 'styled-components'

import { openInWebBrowser } from '../../utils/misc'
import ActionLink from '../ActionLink'
import ExpandableSection from '../ExpandableSection'
import InfoBox from '../InfoBox'
import Input from './Input'

interface Props {
  value: string
  onChange: (passphrase: string) => void
}

const passphraseLink = 'https://wiki.alephium.org/wallet/Desktop-Wallet-Guide#passphrase'

const WalletPassphrase = ({ value, onChange }: Props) => (
  <ExpandableSection sectionTitleClosed="Optional passphrase (advanced)" centered>
    <InfoBox noMarginBottom importance="alert">
      <p>
        <WarningEmphasis>This is an advanced feature! </WarningEmphasis>
        <br />
        <span>Use it only if you know what you are doing. Please, consult our </span>
        <ActionLink onClick={() => openInWebBrowser(passphraseLink)}>documentation</ActionLink>
        <span> to learn about it.</span>
      </p>
    </InfoBox>
    <Input value={value} label="Optional passphrase" type="password" onChange={(e) => onChange(e.target.value)} />
  </ExpandableSection>
)

const WarningEmphasis = styled.strong`
  color: ${({ theme }) => theme.global.alert};
`

export default WalletPassphrase
