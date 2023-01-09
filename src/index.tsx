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

import './index.css' // Importing CSS through CSS file to avoid font flickering
import './i18n'
import '@yaireo/tagify/dist/tagify.css' // Tagify CSS: important to import after index.css file

import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { HashRouter as Router } from 'react-router-dom'
import { ThemeProvider } from 'styled-components'

import App from './App'
import { AddressesContextProvider } from './contexts/addresses'
import { GlobalContextProvider } from './contexts/global'
import { SendModalContextProvider } from './contexts/sendModal'
import { WalletConnectContextProvider } from './contexts/walletconnect'
import * as serviceWorker from './serviceWorker'
import { store } from './store/store'
import { GlobalStyle } from './style/globalStyles'
import { lightTheme } from './style/themes'

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const root = createRoot(document.getElementById('root')!)

root.render(
  <StrictMode>
    <Provider store={store}>
      <Router>
        <ThemeProvider theme={lightTheme}>
          <Suspense fallback="loading">
            <GlobalContextProvider>
              <AddressesContextProvider>
                <SendModalContextProvider>
                  <WalletConnectContextProvider>
                    <GlobalStyle />
                    <App />
                  </WalletConnectContextProvider>
                </SendModalContextProvider>
              </AddressesContextProvider>
            </GlobalContextProvider>
          </Suspense>
        </ThemeProvider>
      </Router>
    </Provider>
  </StrictMode>
)

//
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()
