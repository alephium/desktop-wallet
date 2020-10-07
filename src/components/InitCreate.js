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

import React from "react";
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';
import FileCopyIcon from '@material-ui/icons/FileCopy';

import { Wizard, Step, StepUserCreate } from './Wizard'

import ALF from "alf-client";
const storage = ALF.utils.Storage();

class StepGenerate extends Step {
  constructor() {
    super(2);
  }

  renderStep() {
    return (
      <div>
        <h1>Create wallet</h1>
        <TextField className="field" label="Address" variant="filled" value={this.props.wallet.address} />
        <TextField className="field" label="Secret phrase" variant="filled" multiline="true" value={this.props.mnemonic} />
        <IconButton onClick={e => this.copy(e)}><FileCopyIcon/></IconButton>
        <div className="actions">
          <p>
            <Button onClick={e => this.props.next()} variant="contained" className="buttonLarge">Continue</Button>
          </p>
          <p>
            <Button onClick={e => this.props.back()} variant="contained" className="buttonLarge">Back</Button>
          </p>
        </div>
      </div>
    )
  }

  copy(e) {
    navigator.clipboard.writeText(this.props.mnemonic);
  }

}

class StepConfirm extends Step {
  constructor() {
    super(3);
    this.state = {
      mnemonic: ""
    };
  }

  renderStep() {
    return (
      <div>
        <h1>Create wallet</h1>
        <TextField className="field" label="Secret phrase" value={this.state.mnemonic} onChange={e => this.updateMnemonic(e) }/>
        <div className="actions">
          <p>
            <Button onClick={e => this.create()} variant="contained" className="buttonLarge" disabled={!this.isMnemonicValid()}>Create</Button>
          </p>
          <p>
            <Button onClick={e => this.props.back()} variant="contained" className="buttonLarge">Back</Button>
          </p>
        </div>
      </div>
    )
  }

  async create() {
    if (this.isMnemonicValid()) {
      const walletEncrypted = await this.props.wallet.encrypt(this.props.credentials.password);
      storage.save(this.props.credentials.username, walletEncrypted);
      this.props.setWallet(this.props.wallet);
    }
  }

  isMnemonicValid() {
    return (this.props.mnemonic === this.state.mnemonic);
  }

  updateMnemonic(e) {
    this.setState({
      mnemonic: e.target.value
    });
  }
}

class InitCreate extends Wizard {
  constructor(props) {
    super();
    const result = ALF.wallet.generate(props.networkType);
    this.state.wallet = result.wallet;
    this.state.mnemonic = result.mnemonic;
  }

  render() {
    return (
      <div>
        <StepUserCreate step={this.state.step} next={this.next} setCredentials={this.setCredentials}/>
        <StepGenerate step={this.state.step} back={this.back} next={this.next} wallet={this.state.wallet} mnemonic={this.state.mnemonic}/>
        <StepConfirm step={this.state.step} back={this.back} credentials={this.state.credentials} wallet={this.state.wallet} setWallet={this.props.setWallet} mnemonic={this.state.mnemonic}/>
      </div>
    )
  }
}

export default InitCreate;

