import React, { Component } from "react";
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import { useStyles } from "../utils/util";

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
       <center>
         <h1>Welcome!</h1>
         <img alt="wallet" src={wallet} className="logo"/>
         <p>
           <Button onClick={e => this.generate(e)} variant="contained">Create a new wallet</Button>
         </p>
         <p>
           <Button onClick={e => this.props.next()} variant="contained">Import a wallet</Button>
         </p>
       </center>
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
    const { classes } = this.props;
    return(
      <div>
        <h1>Import wallet</h1>
        <form noValidate autoComplete="off">
          <TextField className={classes.field} id="wallet.key" label="Private key" value={this.state.privateKey} onChange={e => this.updatePrivateKey(e) }/>
        </form>
        <p>
          <Button onClick={e => this.import(e)} variant="contained">Import</Button>
          <Button onClick={e => this.props.back()} variant="contained">Cancel</Button>
        </p>
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
    const { classes } = this.props;
    return (
      <div>
        <Init step={this.state.step} next={this.next} setWallet={this.props.setWallet}/>
        <Import step={this.state.step} back={this.back} setWallet={this.props.setWallet} classes={classes}/>
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

export default withStyles(useStyles)(Wizard);
