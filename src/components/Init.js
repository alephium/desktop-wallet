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

import React, { Component } from "react";
import Button from '@material-ui/core/Button';

import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';

import { Link } from 'react-router-dom'

import wallet from '../images/wallet.png';

import ALF from "alf-client";
const storage = ALF.utils.Storage();

class Init extends Component {
  constructor(props) {
    super();
    this.state = {
      usernames: [],
      username: '',
      password: '',
      networkType: props.networkType
    };
  }

  render() {
     return(
       <div>
        <div className="welcome">
          <h1>Welcome!</h1>
          <img alt="wallet" src={wallet} className="logo"/>
        </div>
        {this.state.usernames.length > 0 &&
          <div>
            <div>
              <Autocomplete
                id="username"
                options={this.state.usernames}
                renderInput={(params) => <TextField {...params} label="User" variant="outlined" />}
                onInputChange={e => this.updateUsername(e) }
              />
              <TextField className="field" label="Password" type="password"
                value={this.state.password}
                onChange={e => this.updatePassword(e) }
              />
            </div>
            <div className="actions">
              <p><Button onClick={e => this.login(e)} variant="contained" className="buttonLarge">Login</Button></p>
            </div>
            <hr/>
          </div>
        }
        <div className="actions">
          <p>
            <Link to="/create">
              <Button variant="contained" className="buttonLarge">Create a new wallet</Button>
            </Link>
          </p>
          <p>
            <Link to="/import">
              <Button variant="contained" className="buttonLarge">Import a wallet</Button>
            </Link>
          </p>
        </div>
       </div>
    );
  }

  async componentDidMount() {
    this.setState({
      usernames: storage.list()
    });
  }

  async login(e) {
    const walletEncrypted = storage.load(this.state.username);
    if (walletEncrypted === null) {
      alert('User not found.');
    } else {
      try {
        var wallet = await ALF.wallet.open(this.state.password, walletEncrypted, this.state.networkType);
        wallet.username = this.state.username;
        this.props.setWallet(wallet);
      } catch (e) {
        alert('Invalid password.');
        throw e;
      }
    }
  }

  updatePassword(e) {
    this.setState({
      password: e.target.value
    });
  }

  updateUsername(e) {
    this.setState({
      username: e.target.innerText
    });
  }
}

export default Init;
