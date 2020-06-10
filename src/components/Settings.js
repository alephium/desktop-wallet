import React, { Component } from "react";
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import { settingsDefault, settingsLoad, settingsSave, useStyles } from "../utils/util";
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
    const { classes } = this.props;
    return (
      <div className={classes.root}>
        <div className={classes.form}>
          <div className={classes.section}>
            <h2>Network</h2>
            <form noValidate autoComplete="off">
              <TextField className={classes.field} id="network.host" label="Host" value={this.state.networkHost} onChange={e => this.updateNetworkHost(e) }/>
              <TextField className={classes.field} id="network.port" label="Port" value={this.state.networkPort} onChange={e => this.updateNetworkPort(e) }/>
            </form>
            <Button variant="contained" onClick={e => this.save()}>Save changes</Button>
          </div>
          <div className={classes.section}>
            <h2>Wallet</h2>
            <Button variant="contained" onClick={e => this.reset()}>Reset</Button>
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

export default withStyles(useStyles)(Settings);
