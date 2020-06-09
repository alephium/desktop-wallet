import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Redirect, Route} from 'react-router-dom'
import './index.css';
import * as serviceWorker from './serviceWorker';

import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import { green, purple } from '@material-ui/core/colors/blue';

import logo from './images/logo.png';

import Navigator from './components/Navigator'
import Settings from './components/Settings'
import Wallet from './components/Wallet'
import Wizard from './components/Wizard'
import withTheme from './components/Theme'

import ALF from "alf-client";

const storage = ALF.utils.Storage();

const theme = createMuiTheme({
  palette: {
    type: 'dark',
    primary: green,
    secondary: purple,
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
  },
});

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      wallet: storage.load('default'),
    };
    this.setWallet = this.setWallet.bind(this); 
  }

  setWallet(wallet) {
    this.setState({wallet: wallet});
  }

  render() {
    if (!this.state.wallet) {
      return (
        <div>
          <img alt="alephium" src={logo} className="logo"/>
          <Wizard setWallet={this.setWallet}/>
        </div>
      )
    } else {
      return (
        <Router>
          <div>
            <img alt="alephium" src={logo} className="logo"/>
            <Navigator/>
            <main>
              <Route exact path="/">
                <Wallet wallet={this.state.wallet}/>
              </Route>
              <Route path="/wallet">
                <Wallet wallet={this.state.wallet}/>
              </Route>
              <Route path="/settings">
                <Settings setWallet={this.setWallet}/>
              </Route>
              <Redirect to='/' />
            </main>
          </div>
        </Router>
      )
    }
  }
}

const AppWithTheme = withTheme(App)

ReactDOM.render(<AppWithTheme/>, document.getElementById('root'));

//
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
