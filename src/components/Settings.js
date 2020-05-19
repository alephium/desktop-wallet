import React, { Component } from "react";
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import { settingsDefault, settingsLoad, settingsSave } from "../utils/util";

const useStyles = theme => ({
  root: {
    padding: 24,
  },
  section: {
    paddingBottom: 42,
  },
  form: {
    width: 600,
    margin: 'auto',
  },
  field: {
    width: 600,
  }
});

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
          </div>
          <div className={classes.section}>
            <Button variant="contained" onClick={e => this.save()}>Save changes</Button>
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

  save() {
    const settings = {
      host: this.state.networkHost,
      port: this.state.networkPort
    };

    settingsSave(settings);
  }
}

export default withStyles(useStyles)(Settings);
