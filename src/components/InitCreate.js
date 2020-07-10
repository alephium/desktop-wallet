import React, { Component } from "react";
import Button from '@material-ui/core/Button';
import { Link } from 'react-router-dom'
import Typography from '@material-ui/core/Typography';

import { Wizard, Step } from './Wizard'

import ALF from "alf-client";
const storage = ALF.utils.Storage();

class InitCreate extends Wizard {
  constructor() {
    super();
    this.state = {
      wallet: ALF.wallet.generate(),
    };
  }

  render() {
    return (
      <div>
        <Typography variant="subtitle2">{this.state.wallet.address}</Typography>
        <Typography variant="subtitle2">{this.state.wallet.mnemonic}</Typography>
        <div className="actions">
          <p><Button onClick={e => this.create(e)} variant="contained" className="buttonLarge">Create</Button></p>
          <p>
            <Link to="/">
              <Button variant="contained" className="buttonLarge">Cancel</Button>
            </Link>
          </p>
        </div>
      </div>
    )
  }

  create(e) {
    const wallet = ALF.wallet.generate();
    storage.save('default', wallet);
    this.props.setWallet(wallet);
  }
}

export default InitCreate;
