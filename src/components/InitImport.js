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

import React from 'react'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import { Link } from 'react-router-dom'

import { Wizard, Step, StepUserCreate } from './Wizard'
import ALF from 'alf-client'
const storage = ALF.utils.Storage()

import bip39 from 'bip39'

class StepImport extends Step {
  constructor(props) {
    super(2)
    this.state = {
      mnemonic: null,
      networkType: props.networkType
    }
  }

  renderStep() {
    return (
      <div>
        <h1>Import wallet</h1>
        <TextField
          className="field"
          label="Secret phrase"
          multiline="true"
          value={this.state.mnemonic}
          onChange={(e) => this.update(e)}
        />
        <div className="actions">
          <p>
            <Button
              onClick={(e) => this.import(e)}
              variant="contained"
              className="buttonLarge"
              disabled={!this.isMnemonicValid()}
            >
              Import
            </Button>
          </p>
          <p>
            <Link to="/">
              <Button variant="contained" className="buttonLarge">
                Cancel
              </Button>
            </Link>
          </p>
        </div>
      </div>
    )
  }

  isMnemonicValid() {
    return bip39.validateMnemonic(this.state.mnemonic)
  }

  update(e) {
    this.setState({
      mnemonic: e.target.value
    })
  }

  async import(e) {
    const wallet = ALF.wallet.import(this.state.mnemonic, this.state.networkType)
    const walletEncrypted = await wallet.encrypt(this.props.credentials.password)
    storage.save(this.props.credentials.username, walletEncrypted)
    this.props.setWallet(wallet)
  }
}

class InitImport extends Wizard {
  render() {
    return (
      <div>
        <StepUserCreate step={this.state.step} next={this.next} setCredentials={this.setCredentials} />
        <StepImport
          step={this.state.step}
          credentials={this.state.credentials}
          setWallet={this.props.setWallet}
          networkType={this.props.networkType}
        />
      </div>
    )
  }
}

export default InitImport
