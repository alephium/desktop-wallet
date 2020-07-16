import React from "react";
import Button from '@material-ui/core/Button';
import { Link } from 'react-router-dom'
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import zxcvbn from 'zxcvbn';

import { Wizard, Step } from './Wizard'

import ALF from "alf-client";
const storage = ALF.utils.Storage();

class StepUserCreate extends Step {
  constructor() {
    super(1);
    this.state = {
      usernames: storage.list(),
      username: '',
      usernameError: '',
      password: '',
      passwordError: '',
    };
  }

  renderStep() {
    return (
      <div>
        <h1>Create account</h1>
        <TextField className="field" label="Username"
          value={this.state.username} onChange={e => this.updateUsername(e) }/>
        {this.state.usernameError !== null && <h4>{this.state.usernameError}</h4> }
        <TextField className="field" label="Password" type="password"
          value={this.state.password} onChange={e => this.updatePassword(e) }/>
        {this.state.passwordError !== null && <h4>{this.state.passwordError}</h4> }
        <div className="actions">
          <p>
            <Button 
              onClick={e => this.create()} 
              variant="contained" className="buttonLarge" 
              disabled={!(this.state.passwordError == null)}>
              Continue
            </Button>
          </p>
          <p>
            <Link to="/">
              <Button variant="contained" className="buttonLarge">Cancel</Button>
            </Link>
          </p>
        </div>
      </div>
    )
  }

  create() {
    this.props.setCredentials(this.state.username, this.state.password);
    this.props.next()
  }

  updatePassword(e) {
    const password = e.target.value;
    var passwordError = null;

    if (password.length == 0) {
      passwordError = '';
    } else {
      const strength = zxcvbn(password);
      if (strength.score < 1) {
        passwordError = 'Password is too weak';
      } else if (strength.score < 3) {
        passwordError = 'Insecure password';
      }
    }

    this.setState({
      password: password,
      passwordError: passwordError,
    });
  }

  updateUsername(e) {
    const username = e.target.value;
    var usernameError = null;

    if (username.length < 3) {
      usernameError = 'Username is too short';
    } else if (this.state.usernames.includes(username)) {
      usernameError = 'Username already taken';
    }
    this.setState({
      username: e.target.value,
      usernameError: usernameError,
    });
  }
}

class StepGenerate extends Step {
  constructor() {
    super(2);
  }

  renderStep() {
    return (
      <div>
        <h1>Create wallet</h1>
        <TextField className="field" label="Address" variant="filled" value={this.props.wallet.address} />
        <TextField className="field" label="Secret phrase" variant="filled" value={this.props.wallet.mnemonic} />
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
    navigator.clipboard.writeText(this.props.wallet.mnemonic);
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
            <Button onClick={e => this.create(e)} variant="contained" className="buttonLarge" disabled={!this.isMnemonicValid()}>Create</Button>
          </p>
          <p>
            <Button onClick={e => this.props.back()} variant="contained" className="buttonLarge">Back</Button>
          </p>
        </div>
      </div>
    )
  }

  async create(e) {
    if (this.isMnemonicValid()) {
      const walletEncrypted = await this.props.wallet.encrypt(this.props.credentials.password);
      storage.save(this.props.credentials.username, walletEncrypted);
      this.props.setWallet(this.props.wallet);
    }
  }

  isMnemonicValid() {
    return (this.props.wallet.mnemonic === this.state.mnemonic); 
  }

  updateMnemonic(e) {
    this.setState({
      mnemonic: e.target.value
    });
  }
}

class InitCreate extends Wizard {
  constructor() {
    super();
    this.state.wallet = ALF.wallet.generate();
    this.setCredentials = this.setCredentials.bind(this); 
  }

  setCredentials(username, password) {
    this.setState({
      credentials: {
        username: username,
        password: password,
      },
    });
  }

  render() {
    return (
      <div>
        <StepUserCreate step={this.state.step} next={this.next} wallet={this.state.wallet} setCredentials={this.setCredentials}/>
        <StepGenerate step={this.state.step} back={this.back} next={this.next} wallet={this.state.wallet}/>
        <StepConfirm step={this.state.step} back={this.back} credentials={this.state.credentials} wallet={this.state.wallet} setWallet={this.props.setWallet}/>
      </div>
    )
  }
}

export default InitCreate;

