import React, { Component } from "react";
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import AccountBalanceWalletIcon from '@material-ui/icons/AccountBalanceWallet';
import { settingsLoadOrDefault } from "../utils/util";

const {Client} = require('bcurl');

function truncate(str) {
  const len = str.length;
  return len > 10 ? str.substring(0, 6) + "..." + str.substring(len - 6, len) : str;
}

function txReadSummary(tx, addressHash) {
  let summary = {};

  summary.hash = tx.hash;
  summary.sent = txSent(addressHash, tx);
  summary.value = txValue(addressHash, tx, summary.sent);

  return summary;
}

function txSent(addressHash, tx) {
  for (var i = 0; i < tx.outputs.length; i++) {
    if (tx.outputs[i].address === addressHash) {
      return false;
    }
  }

  return true;
}

function txValue(addressHash, tx, sent) {
  let total = 0;

  for (var i = 0; i < tx.outputs.length; i++) {
    if (tx.outputs[i].address === addressHash) {
      if (!sent) {
        total += tx.outputs[i].value; 
      }
    } else {
      if (sent) {
        total += tx.outputs[i].value; 
      }
    }
  }

  return total;
}


class Transactions extends Component {
  constructor() {
    super();
    this.state = {
      transactions: [],
    };
  }

  render() {
    return (
      <div>
        {this.state.transactions.map((tx) => (
          <div key={tx.hash} className="card">
            <Card>
              <CardContent className="cardContent">
                  <div>
                    {tx.sent ? "Sent" : "Received"}: {tx.value} א 
                  </div>
                  <div className="cardRight">
                    <a href={this.state.alephscanURL + "/transactions/" + tx.hash}  target="_blank" rel="noopener noreferrer">{truncate(tx.hash)}</a>
                  </div>
                  <div>
                    <AccountBalanceWalletIcon/>
                    {tx.sent ? <ArrowForwardIcon/> : <ArrowBackIcon/>}
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

    const transactions = await client.get('/addresses/' + wallet.address + '/transactions');

    this.setState({ 
      alephscanURL: settings.alephscanURL,
      transactions: transactions.reverse().map(x => txReadSummary(x, wallet.address)),
    });
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
