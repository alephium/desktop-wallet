/*
Copyright 2018 - 2022 The Alephium Authors
This file is part of the alephium project.

The library is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with the library. If not, see <http://www.gnu.org/licenses/>.
*/

import { createSlice, PayloadAction } from '@reduxjs/toolkit'

const sliceName = 'activeWallet'

interface ActiveWalletState {
  name?: string
  mnemonic?: string
  isPassphraseUsed?: boolean
}

const initialState: ActiveWalletState = {
  name: undefined,
  mnemonic: undefined,
  isPassphraseUsed: undefined
}

const activeWalletSlice = createSlice({
  name: sliceName,
  initialState,
  reducers: {
    walletSaved: (_, action: PayloadAction<Required<Pick<ActiveWalletState, 'name' | 'mnemonic'>>>) => action.payload,
    walletUnlocked: (_, action: PayloadAction<ActiveWalletState>) => action.payload,
    walletLocked: () => initialState,
    walletDeleted: (state, action: PayloadAction<string>) => {
      const deletedWalletName = action.payload

      if (state.name === deletedWalletName) {
        return initialState
      }
    }
  }
})

export const { walletSaved, walletLocked, walletUnlocked, walletDeleted } = activeWalletSlice.actions

export default activeWalletSlice
