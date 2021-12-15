import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { HashRouter as Router } from 'react-router-dom'

import App from '../App'

jest.mock('alephium-js', () => ({
  getStorage: jest.fn().mockImplementation(() => ({
    list: () => ['Account 1', 'Account 2'],
    load: () => 'walletEncrypted'
  })),
  walletOpen: () => ({}),
  CliqueClient: function () {
    return {
      baseUrl: 'https://mock-node',
      init: jest.fn()
    }
  },
  ExplorerClient: function () {
    return {
      baseUrl: 'https://mock-explorer'
    }
  }
}))

beforeEach(async () => {
  await waitFor(() =>
    render(
      <Router>
        <App />
      </Router>
    )
  )
})

it('should display login form when accounts exist in storage', () => {
  expect(screen.getByText('Please choose an account and enter your password to continue.')).toBeInTheDocument()
})

it('should display available accounts to login with when clicking the Account input field', () => {
  fireEvent.click(screen.getByLabelText('Account'))

  expect(screen.getByText('Account 1')).toBeInTheDocument()
  expect(screen.getByText('Account 2')).toBeInTheDocument()
})

it('should open the wallet page when after logging in', async () => {
  fireEvent.click(screen.getByLabelText('Account'))
  fireEvent.click(screen.getByText('Account 1'))
  fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'fake-password' } })
  fireEvent.click(screen.getByRole('button', { name: 'Login' }))

  expect(screen.getByText('Account: Account 1')).toBeInTheDocument()
})

afterAll(() => {
  jest.clearAllMocks()
})
