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

import React, { Component } from "react";
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import { createClient } from "../utils/util";
import { settingsLoadOrDefault } from "../utils/util";

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
            <h3>Address</h3>
            <Typography variant="subtitle2"><a href={this.state.alephscanURL + "/addresses/" + wallet.address} target="_blank" rel="noopener noreferrer">{wallet.address}</a></Typography>
          </div>
          <br/>
          <div className="section">
            <h3>Balance</h3>
            <TextField className="field" id="filled-basic" label="ALF" variant="filled" value={this.state.balance} />
            <div className="actions">
              <p>
                <Button variant="contained" className="buttonLarge"  onClick={e => this.getBalance(e)}>Get balance</Button>
              </p>
            </div>
          </div>
          <br/>
          <div className="section">
            <h3>Send</h3>
            <TextField id="to" className="field" label="Recipient address" value={this.state.transferTo} onChange={e => this.updateTransferTo(e) }/>
            <TextField id="value" label="ALF" className="field" value={this.state.transferValue} onChange={e => this.updateTransferValue(e) }/>
            <div className="actions">
              <br/>
              <div>
                <Button variant="contained" className="buttonLarge" onClick={e => this.transfer(e)}>Send</Button>
              </div>
            </div>
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

    let settings = settingsLoadOrDefault();

    this.setState({ 
      alephscanURL: settings.alephscanURL
    });
  }

  async getBalance(e) {
    try {
      const response = await this.client.getBalance(this.props.wallet.address);
      this.setState({
        balance: response.result.balance + ' א'
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

  async transfer(e) {
    const wallet = this.props.wallet;
    try {
      const responseCreate = await this.client.transactionCreate(wallet.address, wallet.publicKey,
                                                  this.state.transferTo, this.state.transferValue);
      const signature = this.client.transactionSign(responseCreate.result.hash, wallet.privateKey); 
      const response = await this.client.transactionSend(wallet.address, responseCreate.result.unsignedTx, signature);

      this.setState({
        dialogOpen: true,
        dialogTitle: 'Transaction submitted',
        dialogMessage: response.result.txId + '\n' +
          'chain index: ' + response.result.fromGroup + ' ➡ ' + response.result.toGroup
      });
    } catch (e) {
      this.dialogError(e.message);
      throw e;
    }
  }

  updateTransferTo(e) {
    this.setState({
      transferTo: e.target.value
    });
  }

  updateTransferValue(e) {
    this.setState({
      transferValue: e.target.value
    });
  }
}

export default Wallet;
