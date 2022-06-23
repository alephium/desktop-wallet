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
import { act, fireEvent, screen, waitFor } from '@testing-library/react'
import { HashRouter as Router } from 'react-router-dom'
import { PartialDeep } from 'type-fest'

import App from '../App'
import { GlobalContextProps } from '../contexts/global'
import { renderWithGlobalContext } from '.'

jest.mock('@alephium/sdk', () => ({
  ...jest.requireActual('@alephium/sdk'),
  getStorage: jest.fn().mockImplementation(() => ({
    list: () => ['Wallet 1', 'Wallet 2'],
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

jest.mock('../utils/migration', () => ({
  migrateUserData: () => ({})
}))

const walletLockTimeInMinutes = 4

beforeEach(async () => {
  const context: PartialDeep<GlobalContextProps> = {
    settings: {
      general: {
        walletLockTimeInMinutes: walletLockTimeInMinutes
      }
    }
  }

  await waitFor(() => {
    renderWithGlobalContext(
      <Router>
        <App />
      </Router>,
      context
    )
  })
})

it('should display login form when wallets exist in storage', () => {
  expect(screen.getByText('Please choose a wallet and enter your password to continue.')).toBeInTheDocument()
})

it('should display available wallets to login with when clicking the Wallet input field', () => {
  fireEvent.click(screen.getByLabelText('Wallet'))

  expect(screen.getByText('Wallet 1')).toBeInTheDocument()
  expect(screen.getByText('Wallet 2')).toBeInTheDocument()
})

it('should lock the wallet when idle for too long after successful login', async () => {
  jest.useFakeTimers('modern')
  jest.spyOn(global, 'setInterval')

  // 1. Login
  fireEvent.click(screen.getByLabelText('Wallet'))
  fireEvent.click(screen.getByText('Wallet 1'))
  fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'fake-password' } })
  fireEvent.click(screen.getByRole('button', { name: 'Login' }))

  // 2. Check that we have successfully logged in
  expect(screen.getByText('Transaction history')).toBeInTheDocument()

  // 3. Advance time so that the interval that checks if we need to lock out runs
  act(() => {
    jest.runOnlyPendingTimers()
  })

  // 4. Ensure that we are not locked out if we are idle for less than the lock time (ex: 1 minute less)
  const stayIdleTimeoutInMinutes = walletLockTimeInMinutes - 1
  jest.setSystemTime(new Date(new Date().getTime() + stayIdleTimeoutInMinutes * 60 * 1000))
  act(() => {
    jest.runOnlyPendingTimers()
  })
  expect(screen.getByText('Transaction history')).toBeInTheDocument()

  // 5. Move the mouse
  act(() => {
    fireEvent.mouseMove(screen.getByRole('main'))
  })

  // 6. Advance time and ensure that we are still not locked out, since the mouse moved (ex: another 3 minutes)
  jest.setSystemTime(new Date(new Date().getTime() + 3 * 60 * 1000))
  act(() => {
    jest.runOnlyPendingTimers()
  })
  expect(screen.getByText('Transaction history')).toBeInTheDocument()

  // 8. Finally, advance time without any interaction and expect to be locked out
  jest.setSystemTime(new Date(new Date().getTime() + 4 * 60 * 1000))
  act(() => {
    jest.runOnlyPendingTimers()
  })
  expect(screen.getByRole('main')).toHaveTextContent('Welcome back!')
  expect(screen.getByRole('main')).toHaveTextContent('Please choose a wallet and enter your password to continue')
})

afterAll(() => {
  jest.clearAllMocks()
  jest.useRealTimers()
})
