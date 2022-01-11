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

import { fireEvent, screen, waitFor, waitForElementToBeRemoved } from '@testing-library/react'
import { Wallet } from 'alephium-js'
import { PartialDeep } from 'type-fest'

import { GlobalContextProps } from '../../contexts/global'
import WalletHomePage from '../../pages/Wallet/WalletHomePage'
import { renderWithGlobalContext } from '..'
import addressMockData from '../fixtures/address.json'
import wallet from '../fixtures/wallet.json'

const mockedHistoryPush = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({
    push: mockedHistoryPush
  })
}))

beforeEach(async () => {
  const walletMock = new Wallet({ ...wallet, seed: Buffer.from(wallet.seed, 'hex') })
  const getAddressDetailsMock = jest
    .fn()
    .mockResolvedValueOnce({ data: addressMockData.initialFetch.details })
    .mockResolvedValueOnce({ data: addressMockData.initialFetch.details }) // TODO: Remove this line after figuring out why useEffect is called twice
    .mockResolvedValueOnce({ data: addressMockData.refresh.details })
  const getAddressTransactionsMock = jest
    .fn()
    .mockResolvedValueOnce({ data: addressMockData.initialFetch.transactions })
    .mockResolvedValueOnce({ data: addressMockData.initialFetch.transactions }) // TODO: Remove this line after figuring out why useEffect is called twice
    .mockResolvedValueOnce({ data: addressMockData.refresh.transactions })

  const context: PartialDeep<GlobalContextProps> = {
    wallet: walletMock,
    client: {
      explorer: {
        getAddressDetails: getAddressDetailsMock,
        getAddressTransactions: getAddressTransactionsMock
      }
    }
  }
  await waitFor(() => renderWithGlobalContext(<WalletHomePage />, context))
})

it('Button correctly links to wallet settings page', async () => {
  const button = screen.getByLabelText('Settings')
  fireEvent.click(button)
  expect(mockedHistoryPush).toHaveBeenCalledTimes(1)
  expect(mockedHistoryPush).toHaveBeenCalledWith('/wallet/settings')
})

it('Loads balance and number of transactions', () => {
  expect(screen.getByText('299.000 ℵ')).toBeInTheDocument()
  expect(screen.getByText('Transactions (2)')).toBeInTheDocument()
})

it('Refreshes balance and number of transactions', async () => {
  expect(screen.getByText('299.000 ℵ')).toBeInTheDocument()
  const button = screen.getByLabelText('Refresh')
  fireEvent.click(button)
  await waitForElementToBeRemoved(() => screen.queryByText('299.000 ℵ'))
  expect(screen.getByText('300.000 ℵ')).toBeInTheDocument()
  expect(screen.getByText('Transactions (3)')).toBeInTheDocument()
})

afterAll(() => {
  jest.clearAllMocks()
})
