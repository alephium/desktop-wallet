import { render, fireEvent, screen, act, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Wallet } from 'alephium-js'

import WalletHomePage from '../../pages/Wallet/WalletHomePage'
import wallet from '../fixtures/wallet.json'
import { GlobalContext, initialContext } from '../../App'
import addressMockData from '../fixtures/address.json'

const mockedHistoryPush = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({
    push: mockedHistoryPush
  })
}))

const renderWithGlobalContext = async (el: JSX.Element) => {
  const walletMock = new Wallet({ ...wallet, seed: Buffer.from(wallet.seed, 'hex') })
  const getAddressDetailsMock = jest.fn().mockResolvedValue({ data: addressMockData.details })
  const getAddressTransactionsMock = jest.fn().mockResolvedValue({ data: addressMockData.transactions })

  return await render(
    <GlobalContext.Provider
      value={{
        ...initialContext,
        wallet: walletMock,
        client: {
          explorer: {
            getAddressDetails: getAddressDetailsMock,
            getAddressTransactions: getAddressTransactionsMock
          }
        }
      }}
    >
      {el}
    </GlobalContext.Provider>
  )
}

beforeEach(async () => {
  await waitFor(() => renderWithGlobalContext(<WalletHomePage />))
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
