import React, { Component } from "react";
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';
import { createClient } from "../utils/util";
import ALF from "alf-client";

const useStyles = theme => ({
  root: {
    padding: 24,
  },
  section: {
    paddingBottom: 42,
  },
  form: {
    width: 600,
    margin: 'auto',
  },
  field: {
    width: 600,
  }
});

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
    const { classes } = this.props;

    return (
      <div className={classes.root}>
        <div className={classes.form}>
          <div className={classes.section}>
            <form noValidate autoComplete="off">
              <TextField className={classes.field} id="address" label="Address" value={this.state.address} onChange={e => this.updateAddress(e) }/>
            </form>
          </div>
          <div className={classes.section}>
            <h2>Balance</h2>
            <TextField className={classes.field} id="filled-basic" label="ALF" variant="filled" value={this.state.balance} />
            <br/>
            <br/>
            <Button variant="contained" onClick={e => this.getBalance(e)}>Get balance</Button>
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
        this.dialogError('Unable to initialize network client, please check the console for more details.');
      }
    }
  }


  async getBalance(e) {
    try {
      const response = await this.client.getBalance(this.state.address);
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

  updateAddress(e) {
    this.setState({
      address: e.target.value
    });
  }
}

export default withStyles(useStyles)(Wallet);
