/*
Copyright 2018 - 2021 The Alephium Authors
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
import { act, fireEvent, screen, waitFor } from '@testing-library/react'
import { HashRouter as Router } from 'react-router-dom'
import { PartialDeep } from 'type-fest'

import App, { Context } from '../App'
import { renderWithGlobalContext } from '.'

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
  const context: PartialDeep<Context> = {
    settings: {
      general: {
        walletLockTimeInMinutes: 4
      }
    }
  }

  await waitFor(() => {
    renderWithGlobalContext(
      context,
      <Router>
        <App />
      </Router>
    )
  })
})

it('should display login form when accounts exist in storage', () => {
  expect(screen.getByText('Please choose an account and enter your password to continue.')).toBeInTheDocument()
})

it('should display available accounts to login with when clicking the Account input field', () => {
  fireEvent.click(screen.getByLabelText('Account'))

  expect(screen.getByText('Account 1')).toBeInTheDocument()
  expect(screen.getByText('Account 2')).toBeInTheDocument()
})

it('should lock the wallet when idle for too long after successful login', async () => {
  jest.useFakeTimers('modern')
  jest.spyOn(global, 'setInterval')

  // 1. Login
  fireEvent.click(screen.getByLabelText('Account'))
  fireEvent.click(screen.getByText('Account 1'))
  fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'fake-password' } })
  fireEvent.click(screen.getByRole('button', { name: 'Login' }))

  // 2. Check that we have successfully logged in
  expect(screen.getByText('Account: Account 1')).toBeInTheDocument()

  // 3. Advance time so that the interval that checks if we need to lock out runs
  act(() => {
    jest.runOnlyPendingTimers()
  })

  // 4. Ensure that we are not locked out if we are idle for less than the lock time (ex: 3 minutes)
  jest.setSystemTime(new Date(new Date().getTime() + 3 * 60 * 1000))
  act(() => {
    jest.runOnlyPendingTimers()
  })
  expect(screen.getByText('Account: Account 1')).toBeInTheDocument()

  // 5. Move the mouse
  act(() => {
    fireEvent.mouseMove(screen.getByRole('main'))
  })

  // 6. Advance time and ensure that we are still not locked out, since the mouse moved (ex: another 3 minutes)
  jest.setSystemTime(new Date(new Date().getTime() + 3 * 60 * 1000))
  act(() => {
    jest.runOnlyPendingTimers()
  })
  expect(screen.getByText('Account: Account 1')).toBeInTheDocument()

  // 8. Finally, advance time without any interaction and expect to be locked out
  jest.setSystemTime(new Date(new Date().getTime() + 4 * 60 * 1000))
  act(() => {
    jest.runOnlyPendingTimers()
  })
  expect(screen.getByRole('main')).toHaveTextContent('Welcome back!')
  expect(screen.getByRole('main')).toHaveTextContent('Please choose an account and enter your password to continue')
})

afterAll(() => {
  jest.clearAllMocks()
  jest.useRealTimers()
})
