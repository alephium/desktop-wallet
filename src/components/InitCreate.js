import React from "react";
import Button from '@material-ui/core/Button';
import { Link } from 'react-router-dom'
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';
import FileCopyIcon from '@material-ui/icons/FileCopy';

import { Wizard } from './Wizard'

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
        <h1>Create wallet</h1>
        <TextField className="field" label="Address" variant="filled" value={this.state.wallet.address} />
        <TextField className="field" label="Secret phrase" variant="filled" value={this.state.wallet.mnemonic} />
        <IconButton onClick={e => this.copy(e)}><FileCopyIcon/></IconButton>
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

  copy(e) {
    navigator.clipboard.writeText(this.state.wallet.mnemonic);
  }

  create(e) {
    const wallet = ALF.wallet.generate();
    storage.save('default', wallet);
    this.props.setWallet(wallet);
  }
}

export default InitCreate;
