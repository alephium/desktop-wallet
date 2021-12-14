import { render, fireEvent, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

import HomePage from '../../pages/HomePage'

const mockedHistoryPush = jest.fn()
jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useHistory: () => ({
    push: mockedHistoryPush
  })
}))

it('welcomes the new user and displays initial actions', () => {
  render(<HomePage hasWallet={false} usernames={[]} />)

  const main = screen.getByRole('main')
  expect(main).toHaveTextContent('Welcome!')
  expect(main).not.toHaveTextContent('Welcome back!')
  expect(main).toHaveTextContent('Please choose whether you want to create a new wallet or import an existing one.')
  expect(screen.queryByRole('button', { name: 'New wallet' })).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Import wallet' })).toBeInTheDocument()
  expect(screen.getByTestId('sidebar')).toBeInTheDocument()
})

it('welcomes the user back and displays the login form', () => {
  render(<HomePage hasWallet={true} usernames={['John Doe']} />)

  const main = screen.getByRole('main')
  expect(main).toHaveTextContent('Welcome back!')
  expect(main).toHaveTextContent('Please choose an account and enter your password to continue')
  expect(screen.getByLabelText('Account')).toBeInTheDocument()
  expect(screen.getByLabelText('Password')).toBeInTheDocument()
  expect(main).toHaveTextContent('Create / import a new wallet')
  expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'New wallet' })).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Import wallet' })).not.toBeInTheDocument()
  expect(screen.getByTestId('sidebar')).toBeInTheDocument()
})

it('navigates correctly between "New account" and login pages', () => {
  render(<HomePage hasWallet={true} usernames={['John Doe']} />)

  const main = screen.getByRole('main')

  let link = screen.getByText('Create / import a new wallet')
  fireEvent.click(link)
  expect(main).toHaveTextContent('New account')
  expect(main).toHaveTextContent('Please choose whether you want to create a new wallet or import an existing one.')

  link = screen.getByText('Use an existing account')
  fireEvent.click(link)
  expect(main).toHaveTextContent('Welcome back!')
  expect(main).toHaveTextContent('Please choose an account and enter your password to continue')
})

describe('Button correctly links to', () => {
  beforeEach(() => {
    render(<HomePage hasWallet={false} usernames={[]} />)
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

// TODO: test login form
