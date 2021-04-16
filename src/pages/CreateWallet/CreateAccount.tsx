import { Dispatch, SetStateAction, ChangeEvent, useState, useEffect } from 'react'
import { SectionContent, ContentContainer, PageTitle } from '../../components/PageComponents'
import { Wallet, Storage } from 'alf-client'
import { Input } from '../../components/Inputs'
import { Button } from '../../components/Buttons'
import { InfoBox } from '../../components/InfoBox'
import { FiAlertTriangle } from 'react-icons/fi'
import styled, { useTheme } from 'styled-components'
import Paragraph from '../../components/Paragraph'
import zxcvbn from 'zxcvbn'
import { useHistory } from 'react-router'
import { StepProps } from '.'

interface CreateAccountProps extends StepProps {
  setWallet: Dispatch<SetStateAction<Wallet | undefined>>
}

interface State {
  username: string
  usernames: string[]
  usernameError: string
  password: string
  passwordError: string
  passwordCheck: string
}

const CreateAccount = ({ setWallet, activateNextButton }: CreateAccountProps) => {
  const history = useHistory()
  const theme = useTheme()
  const storage = Storage()

  const [state, setState] = useState<State>({
    username: '',
    usernames: storage.list(),
    usernameError: '',
    password: '',
    passwordError: '',
    passwordCheck: ''
  })

  const { username, usernames, usernameError, password, passwordError, passwordCheck } = state

  const onUpdatePassword = (e: ChangeEvent<HTMLInputElement>): void => {
    const password = e.target.value
    let passwordError = ''

    if (password.length === 0) {
      passwordError = ''
    } else {
      const strength = zxcvbn(password)
      if (strength.score < 1) {
        passwordError = 'Password is too weak'
      } else if (strength.score < 3) {
        passwordError = 'Insecure password'
      }
    }

    setState({
      ...state,
      password,
      passwordError
    })
  }

  const onUpdateUsername = (e: ChangeEvent<HTMLInputElement>) => {
    const username = e.target.value
    let usernameError = ''

    if (username.length < 3) {
      usernameError = 'Username is too short'
    } else if (usernames?.includes(username)) {
      usernameError = 'Username already taken'
    }

    setState({
      ...state,
      username,
      usernameError
    })
  }

  // Is next button activated?
  useEffect(() => {
    activateNextButton(
      password.length > 0 &&
        passwordError.length === 0 &&
        password === passwordCheck &&
        username.length > 0 &&
        usernameError.length === 0
    )
  }, [activateNextButton, password, passwordCheck, passwordError.length, username.length, usernameError.length])

  return (
    <SectionContent>
      <Input
        placeholder="Username"
        onChange={onUpdateUsername}
        error={usernameError}
        isValid={username.length > 0 && usernameError.length === 0}
      />
      <Input
        placeholder="Password"
        type="password"
        onChange={onUpdatePassword}
        error={passwordError}
        isValid={!passwordError && password.length > 0}
      />
      <Input
        placeholder="Retype password"
        type="password"
        onChange={(e) => setState({ ...state, passwordCheck: e.target.value })}
        error={passwordCheck && password !== passwordCheck ? 'Passwords are different' : ''}
        isValid={password.length > 0 && password === passwordCheck}
        disabled={!password || passwordError.length > 0}
      />
      <InfoBox
        Icon={FiAlertTriangle}
        text={'Make sure to keep your password secured as it cannot by restored!'}
        iconColor={theme.global.alert}
      />
      <WarningNote>{'Alephium doesn’t have access to your account.\nYou are the only owner.'}</WarningNote>
    </SectionContent>
  )
}

const WarningNote = styled(Paragraph)`
  text-align: center;
  color: ${({ theme }) => theme.font.secondary};
`

export default CreateAccount
