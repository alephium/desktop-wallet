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
    if (location.pathname === '/transactions') {
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
          <Tab label="Transactions" component={Link} to="/transactions" />
        </Tabs>
      </AppBar>
    );
  }
}

export default withRouter(Navigator);
