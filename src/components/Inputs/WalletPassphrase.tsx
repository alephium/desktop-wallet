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

import { AlertTriangle, X } from 'lucide-react'
import { ChangeEvent, useState } from 'react'
import styled, { useTheme } from 'styled-components'

import InfoBox from '../../components/InfoBox'
import { Section } from '../../components/PageComponents/PageContainers'
import ActionLink from '../ActionLink'
import Button from '../Button'
import Input from './Input'

interface Props {
  value: string
  label: string
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
  isValid: boolean
}

const WalletPassphrase = ({ value, label, onChange, isValid }: Props) => {
  const theme = useTheme()
  const [show, setShow] = useState(false)

  return (
    <>
      {!show && <ActionLinkStyled onClick={() => setShow(true)}>{label}</ActionLinkStyled>}
      {show && (
        <InfoBox Icon={AlertTriangle} importance="accent" label="Advanced option">
          <p>
            The software will derive a new wallet based on this passphrase. Addresses will need to be re-discovered to
            see funds after unlocking.
          </p>
          <SectionStyled>
            <Input
              value={value}
              label="Optional passphrase"
              type="password"
              onChange={onChange}
              isValid={isValid}
              disabled={false}
            />
            <CloseButton onClick={() => setShow(false)} secondary>
              <X color={theme.font.primary} size={18} />
            </CloseButton>
          </SectionStyled>
        </InfoBox>
      )}
    </>
  )
}

export default WalletPassphrase

const ActionLinkStyled = styled(ActionLink)`
  margin-top: 1rem;
`

const SectionStyled = styled(Section)`
  display: flex;
  width: 100%;
  align-items: center;
  flex-direction: row;
`

const CloseButton = styled(Button)`
  width: fit-content;
  margin-left: 1rem;
`
