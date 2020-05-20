import React from 'react';
import ReactDOM from 'react-dom';
import { DefaultRoute } from 'react-router'
import { BrowserRouter as Router, Route} from 'react-router-dom'
import './index.css';
import * as serviceWorker from './serviceWorker';

import logo from './images/logo-h.svg';

import Navigator from './components/Navigator'
import Settings from './components/Settings'
import Wallet from './components/Wallet'
import Wizard from './components/Wizard'

import ALF from "alf-client";
const storage = ALF.utils.Storage();

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      wallet: storage.load('default'),
    };
  }

  async componentDidMount() {
  }

  render() {
    if (!this.state.wallet) {
      return (<Wizard/>)
    } else {
      return (
        <Router>
          <div>
            <img alt="alephium" src={logo} className="logo"/>
            <Navigator/>
            <main>
              <Route exact path="/" component={Wallet}/>
              <Route path="/wallet" component={Wallet} />
              <Route path="/settings" component={Settings} />
            </main>
          </div>
        </Router>
      )
    }
  }
}

ReactDOM.render(<App/>, document.getElementById('root'));

//
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
