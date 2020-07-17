import React from "react";
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import { Link } from 'react-router-dom'

import { Wizard, Step, StepUserCreate } from './Wizard'

import ALF from "alf-client";
const storage = ALF.utils.Storage();

class StepImport extends Step {
  constructor() {
    super(2);
    this.state = {
      seedPhrase: null,
    };
  }

  renderStep() {
    return(
      <div>
        <h1>Import wallet</h1>
        <TextField className="field" id="wallet.key" label="Seed phrase" value={this.state.seedPhrase} onChange={e => this.update(e) }/>
        <div className="actions">
          <p><Button onClick={e => this.import(e)} variant="contained" className="buttonLarge">Import</Button></p>
          <p>
            <Link to="/">
              <Button variant="contained" className="buttonLarge">Cancel</Button>
            </Link>
          </p>
        </div>
      </div>
    );
  }

  update(e) {
    this.setState({
      seedPhrase: e.target.value
    });
  }

  async import(e) {
    const wallet = ALF.wallet.import(this.state.seedPhrase);
    const walletEncrypted = await wallet.encrypt(this.props.credentials.password);
    storage.save(this.props.credentials.username, walletEncrypted);
    this.props.setWallet(wallet);
  }
}


class InitImport extends Wizard {
  render() {
    return (
      <div>
        <StepUserCreate step={this.state.step} next={this.next} setCredentials={this.setCredentials}/>
        <StepImport step={this.state.step} credentials={this.state.credentials} setWallet={this.props.setWallet}/>
      </div>
    )
  }
}

export default InitImport;
