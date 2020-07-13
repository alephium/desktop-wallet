import React from "react";
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import { Link } from 'react-router-dom'

import { Wizard, Step } from './Wizard'

import ALF from "alf-client";
const storage = ALF.utils.Storage();

class StepImport extends Step {
  constructor() {
    super(1);
    this.state = {
      seedPhrase: null,
    };
  }

  renderStep() {
    return(
      <div>
        <h1>Import wallet</h1>
        <form noValidate autoComplete="off">
          <TextField className="field" id="wallet.key" label="Seed phrase" value={this.state.seedPhrase} onChange={e => this.update(e) }/>
        </form>
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

  import(e) {
    const wallet = ALF.wallet.import(this.state.seedPhrase);
    storage.save('default', wallet);
    this.props.setWallet(wallet);
  }
}


class InitImport extends Wizard {
  render() {
    return (
      <div>
        <StepImport step={this.state.step} back={this.back} setWallet={this.props.setWallet}/>
      </div>
    )
  }
}

export default InitImport;
