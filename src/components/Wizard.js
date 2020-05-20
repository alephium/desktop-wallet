import React, { Component } from "react";
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';

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

class Wizard extends Component {
  constructor() {
    super();
    this.state = {
    };
  }

  render() {
    return (
      <div>
        <h1>Welcome</h1>
        <p>
          <Button variant="contained">Create a new wallet</Button>
        </p>
        <p>
          <Button variant="contained">Import a wallet</Button>
        </p>
      </div>
    )
  }
}

export default withStyles(useStyles)(Wizard);
