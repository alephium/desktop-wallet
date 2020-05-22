import React, { Component } from "react";
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import { useStyles } from "../utils/util";
import ALF from "alf-client";
const storage = ALF.utils.Storage();

class Wizard extends Component {
  constructor() {
    super();
    this.state = {
    };
  }

  render() {
    return (
      <div>
        <h1>Welcome</h1>
        <p>
          <Button onClick={e => this.generate(e)} variant="contained">Create a new wallet</Button>
        </p>
        <p>
          <Button variant="contained">Import a wallet</Button>
        </p>
      </div>
    )
  }

  generate(e) {
    const wallet = ALF.wallet.generate();
    storage.save('default', wallet);
    this.props.setWallet(wallet);
  }
}

export default withStyles(useStyles)(Wizard);
