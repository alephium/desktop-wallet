import React, { Component } from "react";
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

import { Link } from 'react-router-dom'

import wallet from '../images/wallet.png';

import ALF from "alf-client";

class Init extends Component {
  render() {
     return(
       <div>
         <div className="welcome">
           <h1>Welcome!</h1>
           <img alt="wallet" src={wallet} className="logo"/>
         </div>
         <div className="actions">
          <p>
            <Link to="/create">
              <Button variant="contained" className="buttonLarge">Create a new wallet</Button>
            </Link>
          </p>
          <p>
            <Link to="/import">
              <Button variant="contained" className="buttonLarge">Import a wallet</Button>
            </Link>
          </p>
         </div>
       </div>
    );
  }
}

export default Init;
