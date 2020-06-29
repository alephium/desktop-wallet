import React, { Component } from "react";
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import AccountBalanceWalletIcon from '@material-ui/icons/AccountBalanceWallet';
import { settingsLoadOrDefault } from "../utils/util";

const keccak = require('keccakjs');
const {Client} = require('bcurl');

function truncate(str) {
  const len = str.length;
  return len > 10 ? str.substring(0, 6) + "..." + str.substring(len - 6, len) : str;
}

class Transactions extends Component {
  constructor() {
    super();
    this.state = {
      transactions: [],
    };
  }

  render() {
    const { wallet } = this.props;


    return (
      <div>
        {this.state.transactions.map((tx) => (
          <div key={tx.hash} className="card">
            <Card>
              <CardContent className="cardContent">
                  <div>
                    {this.txSent(tx) ? "Sent" : "Received"}: {this.txValue(tx)} א 
                  </div>
                  <div className="cardRight">
                    <a href={this.state.alephscanURL + "/transactions/" + tx.hash}  target="_blank" rel="noopener noreferrer">{truncate(tx.hash)}</a>
                  </div>
                  <div>
                    <AccountBalanceWalletIcon/>
                    {this.txSent(tx) ? <ArrowForwardIcon/> : <ArrowBackIcon/>}
                  </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    );
  }


  async componentDidMount() {
    let settings = settingsLoadOrDefault();

    const { wallet } = this.props;

    const client = new Client({
      host: settings.explorerHost,
      port: settings.explorerPort
    });

    var hash = new keccak(256);
    hash.update(Buffer.from(wallet.address, 'hex'))
    const addressHash = hash.digest('hex');
    const transactions = await client.get('/addresses/' + addressHash + '/transactions');

    this.setState({ 
      addressHash: addressHash,
      alephscanURL: settings.alephscanURL,
      transactions: transactions,
    });
  }

  txSent(tx) {
    const addressHash = this.state.addressHash;

    for (var i = 0; i < tx.outputs.length; i++) {
      if (tx.outputs[i].address === addressHash) {
        return true;
      }
    }

    return false;
  }

  txValue(tx) {
    let total = 0;

    for (var i = 0; i < tx.outputs.length; i++) {
      if (tx.outputs[i].address === this.state.addressHash) {
        total += tx.outputs[i].value; 
      }
    }

    return total;
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

export default Transactions;
