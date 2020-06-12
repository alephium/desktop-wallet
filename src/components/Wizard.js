import React, { Component } from "react";
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

import wallet from '../images/wallet.png';

import ALF from "alf-client";
const storage = ALF.utils.Storage();


class Step extends Component {
  constructor(pos) {
    super();
    this.pos = pos;
  }

  render() {
    if (this.props.step !== this.pos) {
      return null;
    } 
    return this.renderStep();
  }

}

class Init extends Step {
  constructor() {
    super(1);
  }

  renderStep() {
     return(
       <div>
         <div className="welcome">
           <h1>Welcome!</h1>
           <img alt="wallet" src={wallet} className="logo"/>
         </div>
         <div className="actions">
          <p><Button onClick={e => this.generate(e)} variant="contained" className="buttonLarge">Create a new wallet</Button></p>
          <p><Button onClick={e => this.props.next()} variant="contained" className="buttonLarge">Import a wallet</Button></p>
         </div>
       </div>
    );
  }

  generate(e) {
    const wallet = ALF.wallet.generate();
    storage.save('default', wallet);
    this.props.setWallet(wallet);
  }
}

class Import extends Step {
  constructor() {
    super(2);
    this.state = {
      privateKey: null,
    };
  }

  renderStep() {
    return(
      <div>
        <h1>Import wallet</h1>
        <form noValidate autoComplete="off">
          <TextField className="field" id="wallet.key" label="Private key" value={this.state.privateKey} onChange={e => this.updatePrivateKey(e) }/>
        </form>
        <div className="actions">
          <p><Button onClick={e => this.import(e)} variant="contained" className="buttonLarge">Import</Button></p>
          <p><Button onClick={e => this.props.back()} variant="contained" className="buttonLarge">Cancel</Button></p>
        </div>
      </div>
    );
  }

  updatePrivateKey(e) {
    this.setState({
      privateKey: e.target.value
    });
  }

  import(e) {
    const wallet = ALF.wallet.import(this.state.privateKey);
    storage.save('default', wallet);
    this.props.setWallet(wallet);
  }
}
class Wizard extends Component {
  constructor() {
    super();
    this.state = {
      step: 1
    };
    this.next = this.next.bind(this); 
    this.back = this.back.bind(this); 
  }

  render() {
    return (
      <div>
        <Init step={this.state.step} next={this.next} setWallet={this.props.setWallet}/>
        <Import step={this.state.step} back={this.back} setWallet={this.props.setWallet}/>
      </div>
    )
  }

  next() {
    this.setState({
      step: this.state.step + 1,
    });
  }
  
  back() {
    this.setState({
      step: this.state.step - 1,
    });
  }
}

export default Wizard;
