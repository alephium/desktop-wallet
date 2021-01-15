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
import { settingsDefault, settingsLoadOrDefault, settingsSave } from "../utils/util";
import ALF from "alf-client";

const storage = ALF.utils.Storage();
const defaults = settingsDefault();

class Settings extends Component {
  constructor() {
    super();
    this.state = {
      networkHost: defaults.host,
      networkPort: defaults.port
    };
  }

  render() {
    return (
      <div>
        <div className="form">
          <div className="section">
            <h3>Network</h3>
            <form noValidate autoComplete="off">
              <TextField className="field" id="network.host" label="Host" value={this.state.networkHost} onChange={e => this.updateNetworkHost(e) }/>
              <TextField className="field" id="network.port" label="Port" value={this.state.networkPort} onChange={e => this.updateNetworkPort(e) }/>
            </form>
          </div>
          <div className="actions">
            <p><Button onClick={e => this.save()} variant="contained" className="buttonLarge">Save changes</Button></p>
            <br/>
            <p><Button onClick={e => this.logout()} variant="contained" className="buttonLarge">Logout</Button></p>
            <p><Button onClick={e => this.delete()} variant="contained" className="buttonLarge">Delete Wallet</Button></p>
          </div>
        </div>
      </div>
    );
  }

  async componentDidMount() {
    const settings = settingsLoadOrDefault();
    if (settings !== null) {
      this.setState({
        networkHost: settings.host,
        networkPort: settings.port,
      });
    }
  }

  updateNetworkHost(e) {
    this.setState({
      networkHost: e.target.value
    });
  }

  updateNetworkPort(e) {
    this.setState({
      networkPort: e.target.value
    });
  }

  delete() {
    storage.remove(this.props.wallet.username);
    this.props.setWallet(null);
  }

  logout() {
    this.props.setWallet(null);
  }

  save() {
    const settings = settingsLoadOrDefault();
    settings.host = this.state.networkHost;
    settings.port = this.state.networkPort;
    settingsSave(settings);
  }
}

export default Settings;
