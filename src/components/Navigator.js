import React from 'react';
import PropTypes from "prop-types";
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { Link, withRouter} from 'react-router-dom'

class Navigator extends React.Component {
  static propTypes = {
    match: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired
  };

  state = {
    value: 0
  };

  handleChange = (event, value) => {
    this.setState({ value })
  };

  render() {
    const { location } = this.props;

    let value = this.state.value;
    if (location.pathname === '/settings') {
      value = 1;
    }

    return (
      <AppBar position="static" color="default">
        <Tabs
          value={value}
          onChange={this.handleChange}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="Wallet" component={Link} to="/wallet" />
          <Tab label="Settings" component={Link} to="/settings" />
        </Tabs>
      </AppBar>
    );
  }
}

export default withRouter(Navigator);
