import React, { Component } from "react";
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import AccountBalanceWalletIcon from '@material-ui/icons/AccountBalanceWallet';
import { createClient } from "../utils/util";

function createData(id, sent, from, to, value, fee) {
  return { id, sent, from, to, value, fee };
}

const addrA = '9f93bf7f1211f510e3d9c4fc7fb933f94830ba83190da62dbfc9baa8b0d36276'
const addrB = '084c799cd551dd1d8d5c5f9a5d593b2e931f5e36122ee5c793c1d08a19839cc0'
const addrC = '0e55092af0746630c98d1b2e0d960617c33f8ea7b55739fd18cb7cd5342a28ca'
const addrD = 'b1ce0aa6fdf3cf349d773243dab9fbbe09d30619f38b0c1e8977e28c4f0bc495'

const rows = [
  createData('b5bb9d8014a0f9b1d61e21e796d78dccdf1352f23cd32812f4850b878ae4944c', true, addrA, addrB, 4.0, 0.0001),
  createData('7d865e959b2466918c9863afca942d0fb89d7c9ac0c99bafc3749504ded97730', true, addrA, addrC, 4.3, 0.00009),
  createData('bf07a7fbb825fc0aae7bf4a1177b2b31fcf8a3feeaf7092761e18c859ee52a9c', false, addrD, addrA, 6.0, 0.0002),
  createData('791d6d09a0e80109d14727523574ad1d14b1ec79ac215ac5dd971eb1c28c1e1f', true, addrA, addrB, 4.3, 0.0002),
  createData('526a025d51cba903cbd1327b014c80bbe0d587b1ca6dd05e1e729573eafd115e', false, addrC, addrA, 3.9, 0.0002),
];


function truncate(str) {
  const len = str.length;
  return len > 10 ? str.substring(0, 6) + "..." + str.substring(len - 6, len) : str;
}

class Transactions extends Component {
  constructor() {
    super();
    this.state = {

    };
  }

  render() {
    const { wallet } = this.props;


    return (
      <div>
        {rows.map((row) => (
          <div className="card">
            <Card>
              <CardContent className="cardContent">
                  <div className="cardRight">
                    {row.sent && <small><i> (fee: {row.fee}) </i></small>}
                  </div>
                  <div>
                    {row.sent ? "Sent" : "Received"}: {row.value} א 
                  </div>
                  <div className="cardRight">
                    <a href="https://www.alephium.org" target="_blank" rel="noopener noreferrer">{truncate(row.id)}</a>
                  </div>
                  <div>
                    <AccountBalanceWalletIcon/>
                    {row.sent ? <ArrowForwardIcon/> : <ArrowBackIcon/>}
                  </div>
              </CardContent>
            </Card>
          </div>
        ))}
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
