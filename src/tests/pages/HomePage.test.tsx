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
import '@testing-library/jest-dom'

import { fireEvent, screen, waitFor } from '@testing-library/react'

import HomePage from '../../pages/HomePage'
import { renderWithGlobalContext } from '..'

const mockedHistoryPush = jest.fn()
jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useNavigate: () => mockedHistoryPush
}))

it('welcomes the new user and displays initial actions', async () => {
  await waitFor(() => renderWithGlobalContext(<HomePage hasWallet={false} accountNames={[]} />))

  const main = screen.getByRole('main')
  expect(main).toHaveTextContent('Welcome!')
  expect(main).not.toHaveTextContent('Welcome back!')
  expect(main).toHaveTextContent('Please choose whether you want to create a new wallet or import an existing one.')
  expect(screen.queryByRole('button', { name: 'New wallet' })).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Import wallet' })).toBeInTheDocument()
  expect(screen.getByTestId('sidebar')).toBeInTheDocument()
})

it('welcomes the user back and displays the login form', async () => {
  await waitFor(() => renderWithGlobalContext(<HomePage hasWallet={true} accountNames={['John Doe']} />))

  const main = screen.getByRole('main')
  expect(main).toHaveTextContent('Welcome back!')
  expect(main).toHaveTextContent('Please choose a wallet and enter your password to continue')
  expect(screen.getByLabelText('Wallet')).toBeInTheDocument()
  expect(screen.getByLabelText('Password')).toBeInTheDocument()
  expect(main).toHaveTextContent('Create / import a new wallet')
  expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'New wallet' })).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Import wallet' })).not.toBeInTheDocument()
  expect(screen.getByTestId('sidebar')).toBeInTheDocument()
})

it('navigates correctly between "New wallet" and login pages', async () => {
  await waitFor(() => renderWithGlobalContext(<HomePage hasWallet={true} accountNames={['John Doe']} />))

  const main = screen.getByRole('main')

  let link = screen.getByText('Create / import a new wallet')
  fireEvent.click(link)
  expect(main).toHaveTextContent('New wallet')
  expect(main).toHaveTextContent('Please choose whether you want to create a new wallet or import an existing one.')

  link = screen.getByText('Use an existing wallet')
  fireEvent.click(link)
  expect(main).toHaveTextContent('Welcome back!')
  expect(main).toHaveTextContent('Please choose a wallet and enter your password to continue')
})

describe('Button correctly links to', () => {
  beforeEach(async () => {
    await waitFor(() => renderWithGlobalContext(<HomePage hasWallet={false} accountNames={[]} />))
  })

  it('the new wallet creation page', () => {
    const button = screen.getByRole('button', { name: 'New wallet' })
    fireEvent.click(button)
    expect(mockedHistoryPush).toHaveBeenCalledTimes(1)
    expect(mockedHistoryPush).toHaveBeenCalledWith('/create')
  })

  it('the new wallet import page', () => {
    const button = screen.getByRole('button', { name: 'Import wallet' })
    fireEvent.click(button)
    expect(mockedHistoryPush).toHaveBeenCalledTimes(1)
    expect(mockedHistoryPush).toHaveBeenCalledWith('/import')
  })
})

afterAll(() => {
  jest.clearAllMocks()
})
