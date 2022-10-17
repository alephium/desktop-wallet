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

import { getStorage, walletOpen } from '@alephium/sdk'
import { FC, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useGlobalContext } from '../contexts/global'
import Button from './Button'
import Input from './Inputs/Input'
import { Section } from './PageComponents/PageContainers'

const Storage = getStorage()

interface PasswordConfirmationProps {
  onCorrectPasswordEntered: (password: string) => void
  isSubmitDisabled?: boolean
  text?: string
  buttonText?: string
  walletName?: string
}

const PasswordConfirmation: FC<PasswordConfirmationProps> = ({
  text,
  buttonText,
  onCorrectPasswordEntered,
  walletName,
  isSubmitDisabled = false,
  children
}) => {
  const { t } = useTranslation('App')
  const { activeWalletName, setSnackbarMessage } = useGlobalContext()
  const [password, setPassword] = useState('')

  const validatePassword = () => {
    const walletEncrypted = Storage.load(walletName || activeWalletName)

    try {
      if (walletOpen(password, walletEncrypted)) {
        onCorrectPasswordEntered(password)
      }
    } catch (e) {
      setSnackbarMessage({ text: t`Invalid password`, type: 'alert' })
    }
  }

  return (
    <>
      <Section>
        <Input value={password} label={text} type="password" onChange={(e) => setPassword(e.target.value)} autoFocus />
        {children && <Children>{children}</Children>}
      </Section>
      <Section>
        <ButtonStyled onClick={validatePassword} submit wide disabled={isSubmitDisabled || !password}>
          {buttonText || t`Submit`}
        </ButtonStyled>
      </Section>
    </>
  )
}

export default PasswordConfirmation

const Children = styled.div`
  width: 100%;
`

const ButtonStyled = styled(Button)`
  margin-top: 20px;
`
