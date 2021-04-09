// Copyright 2018 The Alephium Authors
// This file is part of the alephium project.
//
// The library is free software: you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// The library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public License
// along with the library. If not, see <http://www.gnu.org/licenses/>.

import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter as Router, Redirect, Route } from 'react-router-dom'
import './index.css'
import * as serviceWorker from './serviceWorker'

import { Link } from 'react-router-dom'

import { ThemeProvider } from 'styled-components'
import { GlobalStyle } from './style/globalStyles'
import { lightTheme } from './style/themes'

import LanguageIcon from '@material-ui/icons/Language'
import MenuIcon from '@material-ui/icons/Menu'
import SettingsIcon from '@material-ui/icons/Settings'

import Drawer from '@material-ui/core/Drawer'

import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import MailIcon from '@material-ui/icons/Mail'

import logo from './images/logo.png'

import Navigator from './components/Navigator'
import Settings from './components/Settings'
import Transactions from './components/Transactions'
import Wallet from './components/Wallet'
import Init from './components/Init'
import Home from './pages/Home'
import InitCreate from './components/InitCreate'
import InitImport from './components/InitImport'
import withTheme from './components/Theme'
import styled from 'styled-components'

class App extends React.Component {
  constructor() {
    super()
    this.state = {
      wallet: undefined,
      networkType: 'T'
    }
    this.setWallet = this.setWallet.bind(this)
  }

  setWallet(wallet) {
    this.setState({ wallet: wallet })
  }

  toggleDrawer(open) {
    return (event) => {
      if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
        return
      }

      this.setState({ drawer: open })
    }
  }

  render() {
    if (!this.state.wallet) {
      return (
        <ThemeProvider theme={lightTheme}>
          <GlobalStyle />
          <Container>
            <Router>
              <Route exact path="/">
                <Home hasWallet={this.state.wallet} />
                {/*<Init networkType={this.state.networkType} setWallet={this.setWallet}/>*/}
              </Route>
              <Route path="/import">
                <InitImport networkType={this.state.networkType} setWallet={this.setWallet} />
              </Route>
              <Route path="/create">
                <InitCreate networkType={this.state.networkType} setWallet={this.setWallet} />
              </Route>
            </Router>
          </Container>
        </ThemeProvider>
      )
    } else {
      return (
        <ThemeProvider theme={lightTheme}>
          <GlobalStyle />
          <Container>
            <Router>
              <div>
                <div className="header">
                  <Link onClick={this.toggleDrawer(true)}>
                    <MenuIcon className="buttonTop buttonTopL" />
                  </Link>
                  <img alt="alephium" src={logo} className="logo" />
                  <Link to="/settings">
                    <SettingsIcon className="buttonTop buttonTopR" />
                  </Link>
                </div>
                <Navigator />
                <div className="content">
                  <main>
                    <Route exact path="/">
                      <Wallet wallet={this.state.wallet} />
                    </Route>
                    <Route path="/settings">
                      <Settings wallet={this.state.wallet} setWallet={this.setWallet} />
                    </Route>
                    <Route path="/transactions">
                      <Transactions wallet={this.state.wallet} />
                    </Route>
                    <Route path="/wallet">
                      <Wallet wallet={this.state.wallet} />
                    </Route>
                    <Redirect to="/" />
                  </main>
                </div>
                <Drawer anchor="left" open={this.state.drawer} onClose={this.toggleDrawer(false)}>
                  <div className="drawer">
                    <h1>About</h1>
                    <List>
                      <a href="mailto:info@alephium.org" target="_blank" rel="noopener noreferrer">
                        <ListItem button key="Contact us">
                          <ListItemIcon>
                            <MailIcon />
                          </ListItemIcon>
                          <ListItemText primary="Contact us" />
                        </ListItem>
                      </a>
                      <a href="https://www.alephium.org" target="_blank" rel="noopener noreferrer">
                        <ListItem button key="Visit our website">
                          <ListItemIcon>
                            <LanguageIcon />
                          </ListItemIcon>
                          <ListItemText primary="Visit our website" />
                        </ListItem>
                      </a>
                    </List>
                  </div>
                </Drawer>
              </div>
            </Router>
          </Container>
        </ThemeProvider>
      )
    }
  }
}

const Container = styled.main`
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  display: flex;
`

const AppWithTheme = withTheme(App)

ReactDOM.render(<AppWithTheme />, document.getElementById('root'))

//
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()
