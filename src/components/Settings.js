import React, { Component } from "react";
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import { settingsDefault, settingsLoad, settingsSave } from "../utils/util";
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
            <p><Button onClick={e => this.reset()} variant="contained" className="buttonLarge">Delete Wallet</Button></p>
          </div>
        </div>
      </div>
    );
  }

  async componentDidMount() {
    const settings = settingsLoad();
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

  reset() {
    storage.save('default', null);
    this.props.setWallet(null);
  }

  save() {
    const settings = {
      host: this.state.networkHost,
      port: this.state.networkPort
    };

    settingsSave(settings);
  }
}

export default Settings;
