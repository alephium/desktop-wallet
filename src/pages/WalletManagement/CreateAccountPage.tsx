import { ChangeEvent, useState, useContext } from 'react'
import { PageContainer, SectionContent, FooterActions, PageTitle } from '../../components/PageComponents'
import { Input } from '../../components/Inputs'
import { InfoBox } from '../../components/InfoBox'
import { AlertTriangle } from 'lucide-react'
import styled from 'styled-components'
import Paragraph from '../../components/Paragraph'
import zxcvbn from 'zxcvbn'
import { Button } from '../../components/Buttons'
import { GlobalContext } from '../../App'
import { StepsContext } from '../MultiStepsController'
import { WalletManagementContext } from './WalletManagementContext'

const CreateAccountPage = () => {
  const { setContext, username: existingUsername, password: existingPassword } = useContext(WalletManagementContext)
  const { onButtonBack, onButtonNext } = useContext(StepsContext)

  const [state, setState] = useState({
    username: existingUsername,
    usernameError: '',
    password: existingPassword,
    passwordError: '',
    passwordCheck: existingPassword
  })
  const { username, usernameError, password, passwordError, passwordCheck } = state
  const { usernames } = useContext(GlobalContext)

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
    setState({ ...state, password, passwordError })
  }

  const onUpdateUsername = (e: ChangeEvent<HTMLInputElement>) => {
    const username = e.target.value
    let usernameError = ''

    if (username.length < 3) {
      usernameError = 'Username is too short'
    } else if (usernames?.includes(username)) {
      usernameError = 'Username already taken'
    }

    setState({ ...state, username, usernameError })
  }

  // Is next button activated?
  const isNextButtonActive = () =>
    password.length > 0 &&
    passwordError.length === 0 &&
    password === passwordCheck &&
    username.length > 0 &&
    usernameError.length === 0

  const handleNextButtonClick = () => {
    setContext((prevContext) => ({ ...prevContext, username, password }))
    onButtonNext()
  }

  return (
    <PageContainer>
      <PageTitle color="primary">New Account</PageTitle>
      <SectionContent>
        <Input
          value={username}
          placeholder="Username"
          onChange={onUpdateUsername}
          error={usernameError}
          isValid={username.length > 0 && usernameError.length === 0}
        />
        <Input
          value={password}
          placeholder="Password"
          type="password"
          onChange={onUpdatePassword}
          error={passwordError}
          isValid={!passwordError && password.length > 0}
        />
        <Input
          value={passwordCheck}
          placeholder="Retype password"
          type="password"
          onChange={(e) => setState({ ...state, passwordCheck: e.target.value })}
          error={passwordCheck && password !== passwordCheck ? 'Passwords are different' : ''}
          isValid={password.length > 0 && password === passwordCheck}
          disabled={!password || passwordError.length > 0}
        />
        <InfoBox Icon={AlertTriangle} text={'Make sure to keep your password secured as it cannot be restored!'} />
        <WarningNote>{'Alephium doesn’t have access to your account.\nYou are the only owner.'}</WarningNote>
      </SectionContent>
      <FooterActions apparitionDelay={0.3}>
        <Button secondary onClick={onButtonBack}>
          Cancel
        </Button>
        <Button disabled={!isNextButtonActive()} onClick={handleNextButtonClick}>
          Continue
        </Button>
      </FooterActions>
    </PageContainer>
  )
}

const WarningNote = styled(Paragraph)`
  text-align: center;
  color: ${({ theme }) => theme.font.secondary};
  margin-bottom: 0;
`

export default CreateAccountPage
