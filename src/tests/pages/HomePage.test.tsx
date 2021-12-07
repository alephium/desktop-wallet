import { render, unmountComponentAtNode } from 'react-dom'
import { act } from 'react-dom/test-utils'

import { findElementByText } from '../utils'
import HomePage from '../../pages/HomePage'

let container: Element

const mockedHistoryPush = jest.fn()
jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useHistory: () => ({
    push: mockedHistoryPush
  })
}))

beforeEach(() => {
  container = document.createElement('div')
  document.body.appendChild(container)
})

afterEach(() => {
  unmountComponentAtNode(container)
  container.remove()
  container = null
})

it('renders correct welcome message and actions', () => {
  act(() => {
    render(<HomePage hasWallet={true} usernames={['John Doe']} />, container)
  })
  expect(container.textContent).toContain('Welcome back!')
  expect(container.textContent).toContain('Please choose an account and enter your password to continue')
  expect(container.textContent).toContain('Account')
  expect(container.textContent).toContain('Password')
  expect(container.textContent).toContain('Login')
  expect(container.textContent).toContain('Create / import a new wallet')
  expect(container.textContent).not.toContain('New wallet')
  expect(container.textContent).not.toContain('Import wallet')
  expect(document.querySelector('[data-testid="home-sidebar"]')).toBeInTheDocument()

  act(() => {
    render(<HomePage hasWallet={false} usernames={[]} />, container)
  })
  expect(container.textContent).toContain('Welcome!')
  expect(container.textContent).not.toContain('Welcome back!')
  expect(container.textContent).toContain(
    'Please choose whether you want to create a new wallet or import an existing one.'
  )
  expect(container.textContent).toContain('New wallet')
  expect(container.textContent).toContain('Import wallet')
  expect(document.querySelector('[data-testid="home-sidebar"]')).toBeInTheDocument()
})

it('navigates correctly between "New account" and login pages', () => {
  act(() => {
    render(<HomePage hasWallet={true} usernames={['John Doe']} />, container)
  })
  expect(container.textContent).toContain('Create / import a new wallet')
  expect(document.querySelector('[data-testid="home-sidebar"]')).toBeInTheDocument()

  let link = findElementByText('p', 'Create / import a new wallet')
  link.dispatchEvent(new MouseEvent('click', { bubbles: true }))
  expect(container.textContent).toContain('New account')
  expect(container.textContent).toContain(
    'Please choose whether you want to create a new wallet or import an existing one.'
  )

  link = findElementByText('p', 'Use an existing account')
  link.dispatchEvent(new MouseEvent('click', { bubbles: true }))
  expect(container.textContent).toContain('Welcome back!')
  expect(container.textContent).toContain('Please choose an account and enter your password to continue')
})

it('navigates to new wallet creation page', () => {
  act(() => {
    render(<HomePage hasWallet={false} usernames={[]} />, container)
  })
  const button = findElementByText('button', 'New wallet')
  button.dispatchEvent(new MouseEvent('click', { bubbles: true }))
  expect(mockedHistoryPush).toHaveBeenCalledTimes(1)
  expect(mockedHistoryPush).toHaveBeenCalledWith('/create')
})

it('navigates to new wallet import page', () => {
  act(() => {
    render(<HomePage hasWallet={false} usernames={[]} />, container)
  })
  const button = findElementByText('button', 'Import wallet')
  button.dispatchEvent(new MouseEvent('click', { bubbles: true }))
  expect(mockedHistoryPush).toHaveBeenCalledTimes(1)
  expect(mockedHistoryPush).toHaveBeenCalledWith('/import')
})

// TODO: test login form
