import React, { Component } from "react";
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';
import { createClient } from "../utils/util";

class Wallet extends Component {
  constructor() {
    super();
    this.state = {
      address: '',
      dialogOpen: false,
      dialogTitle: '',
      dialogMessage: '',
      privateKey: '',
      balance: 'unknown',
      transferTo: '',
      transferValue: '',
      newPublicKey: '',
      newPrivateKey: '',
    };
  }

  render() {
    const { wallet } = this.props;

    return (
      <div>
        <div className="form">
          <div className="section">
            <form noValidate autoComplete="off">
              <TextField disabled className="field" id="address" label="Address" value={wallet.address} />
            </form>
          </div>
          <div className="section">
            <h2>Balance</h2>
            <TextField className="field" id="filled-basic" label="ALF" variant="filled" value={this.state.balance} />
            <p>
              <Button variant="contained" onClick={e => this.getBalance(e)}>Get balance</Button>
            </p>
          </div>

          <Dialog
            open={this.state.dialogOpen}
            onClose={this.dialogClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogTitle id="alert-dialog-title">{this.state.dialogTitle}</DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
                {this.state.dialogMessage}
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={e => this.dialogClose()} color="primary">
                Okay
              </Button>
            </DialogActions>
          </Dialog>

        </div>
      </div>
    );
  }

  async componentDidMount() {
    try {
      this.client = await createClient();
    } finally {
      if (!this.client) {
        this.dialogError('Unable to initialize the client, please check your network settings.');
      }
    }
  }

  async getBalance(e) {
    try {
      const response = await this.client.getBalance(this.props.wallet.address);
      this.setState({
        balance: response.result.balance
      });
    } catch (e) {
      this.dialogError(e.message);
      throw e;
    }
  }

  dialogError(message) {
    this.setState({
      dialogOpen: true,
      dialogTitle: 'Error',
      dialogMessage: message
    });
  }

  dialogClose() {
    this.setState({
      dialogOpen: false
    });
  };
}

export default Wallet;
