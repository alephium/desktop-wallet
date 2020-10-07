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
import { Link } from 'react-router-dom'
import TextField from '@material-ui/core/TextField';
import zxcvbn from 'zxcvbn';

import ALF from "alf-client";
const storage = ALF.utils.Storage();

class Step extends Component {
  constructor(pos) {
    super();
    this.pos = pos;
  }

  render() {
    if (this.props.step !== this.pos) {
      return null;
    } 
    return this.renderStep();
  }

}

class StepUserCreate extends Step {
  constructor() {
    super(1);
    this.state = {
      usernames: storage.list(),
      username: '',
      usernameError: '',
      password: '',
      passwordError: '',
    };
  }

  renderStep() {
    return (
      <div>
        <h1>Create account</h1>
        <TextField className="field" label="Username"
          value={this.state.username} onChange={e => this.updateUsername(e) }/>
        {this.state.usernameError !== null && <h4>{this.state.usernameError}</h4> }
        <TextField className="field" label="Password" type="password"
          value={this.state.password} onChange={e => this.updatePassword(e) }/>
        {this.state.passwordError !== null && <h4>{this.state.passwordError}</h4> }
        <div className="actions">
          <p>
            <Button 
              onClick={e => this.create()} 
              variant="contained" className="buttonLarge" 
              disabled={!(this.state.passwordError == null)}>
              Continue
            </Button>
          </p>
          <p>
            <Link to="/">
              <Button variant="contained" className="buttonLarge">Cancel</Button>
            </Link>
          </p>
        </div>
      </div>
    )
  }

  create() {
    this.props.setCredentials(this.state.username, this.state.password);
    this.props.next()
  }

  updatePassword(e) {
    const password = e.target.value;
    var passwordError = null;

    if (password.length === 0) {
      passwordError = '';
    } else {
      const strength = zxcvbn(password);
      if (strength.score < 1) {
        passwordError = 'Password is too weak';
      } else if (strength.score < 3) {
        passwordError = 'Insecure password';
      }
    }

    this.setState({
      password: password,
      passwordError: passwordError,
    });
  }

  updateUsername(e) {
    const username = e.target.value;
    var usernameError = null;

    if (username.length < 3) {
      usernameError = 'Username is too short';
    } else if (this.state.usernames.includes(username)) {
      usernameError = 'Username already taken';
    }
    this.setState({
      username: e.target.value,
      usernameError: usernameError,
    });
  }
}


class Wizard extends Component {
  constructor() {
    super();
    this.state = {
      step: 1
    };
    this.next = this.next.bind(this); 
    this.back = this.back.bind(this); 
    this.setCredentials = this.setCredentials.bind(this); 
  }

  setCredentials(username, password) {
    this.setState({
      credentials: {
        username: username,
        password: password,
      },
    });
  }

  next() {
    this.setState({
      step: this.state.step + 1,
    });
  }
  
  back() {
    this.setState({
      step: this.state.step - 1,
    });
  }
}

export {
  Step,
  StepUserCreate,
  Wizard
}
