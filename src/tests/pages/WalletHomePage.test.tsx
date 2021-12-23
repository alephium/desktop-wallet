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
import '@testing-library/jest-dom'

import { fireEvent, screen, waitFor } from '@testing-library/react'
import { Wallet } from 'alephium-js'

import WalletHomePage from '../../pages/Wallet/WalletHomePage'
import addressMockData from '../fixtures/address.json'
import wallet from '../fixtures/wallet.json'
import { renderWithGlobalContext } from '../index.test'

const mockedHistoryPush = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({
    push: mockedHistoryPush
  })
}))

beforeEach(async () => {
  const walletMock = new Wallet({ ...wallet, seed: Buffer.from(wallet.seed, 'hex') })
  const getAddressDetailsMock = jest.fn().mockResolvedValue({ data: addressMockData.details })
  const getAddressTransactionsMock = jest.fn().mockResolvedValue({ data: addressMockData.transactions })

  const context = {
    wallet: walletMock,
    client: {
      explorer: {
        getAddressDetails: getAddressDetailsMock,
        getAddressTransactions: getAddressTransactionsMock
      }
    }
  }
  await waitFor(() => renderWithGlobalContext(context, <WalletHomePage />))
})

it('Button correctly links to wallet settings page', async () => {
  const button = screen.getByLabelText('Settings')
  fireEvent.click(button)
  expect(mockedHistoryPush).toHaveBeenCalledTimes(1)
  expect(mockedHistoryPush).toHaveBeenCalledWith('/wallet/settings')
})

it('Loads balance and transaction data', () => {
  expect(screen.getByText('299.000 ℵ')).toBeInTheDocument()
})

afterAll(() => {
  jest.clearAllMocks()
})
