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
import '@yaireo/tagify/dist/tagify.css' // Tagify CSS: important to import after index.css file

import React from 'react'
import ReactDOM from 'react-dom'
import { HashRouter as Router } from 'react-router-dom'
import { ThemeProvider } from 'styled-components'

import App from './App'
import { AddressesContextProvider } from './contexts/addresses'
import { GlobalContextProvider } from './contexts/global'
import * as serviceWorker from './serviceWorker'
import { GlobalStyle } from './style/globalStyles'
import { lightTheme } from './style/themes'

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <GlobalContextProvider>
        <AddressesContextProvider>
          <ThemeProvider theme={lightTheme}>
            <GlobalStyle />
            <App />
          </ThemeProvider>
        </AddressesContextProvider>
      </GlobalContextProvider>
    </Router>
  </React.StrictMode>,
  document.getElementById('root')
)

//
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()
