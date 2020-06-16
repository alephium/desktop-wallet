import React, { Component } from "react";
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper';
import { createClient } from "../utils/util";

function createData(id, from, to, value) {
  return { id, from, to, value };
}

const addrA = '9f93bf7f1211f510e3d9c4fc7fb933f94830ba83190da62dbfc9baa8b0d36276'
const addrB = '084c799cd551dd1d8d5c5f9a5d593b2e931f5e36122ee5c793c1d08a19839cc0'
const addrC = '0e55092af0746630c98d1b2e0d960617c33f8ea7b55739fd18cb7cd5342a28ca'
const addrD = 'b1ce0aa6fdf3cf349d773243dab9fbbe09d30619f38b0c1e8977e28c4f0bc495'

const rows = [
  createData('b5bb9d8014a0f9b1d61e21e796d78dccdf1352f23cd32812f4850b878ae4944c', addrA, addrB, 4.0),
  createData('7d865e959b2466918c9863afca942d0fb89d7c9ac0c99bafc3749504ded97730', addrA, addrC, 4.3),
  createData('bf07a7fbb825fc0aae7bf4a1177b2b31fcf8a3feeaf7092761e18c859ee52a9c', addrD, addrA, 6.0),
  createData('791d6d09a0e80109d14727523574ad1d14b1ec79ac215ac5dd971eb1c28c1e1f', addrA, addrB, 4.3),
  createData('526a025d51cba903cbd1327b014c80bbe0d587b1ca6dd05e1e729573eafd115e', addrC, addrA, 3.9),
];

class Transactions extends Component {
  constructor() {
    super();
    this.state = {

    };
  }

  render() {
    const { wallet } = this.props;

    return (
      <TableContainer component={Paper}>
        <Table className="table" aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Transaction #</TableCell>
              <TableCell align="right">From</TableCell>
              <TableCell align="right">To</TableCell>
              <TableCell align="right">Value</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.name}>
                <TableCell component="th" scope="row">
                  {row.name}
                </TableCell>
                <TableCell align="right">{row.from}</TableCell>
                <TableCell align="right">{row.to}</TableCell>
                <TableCell align="right">{row.value}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
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
