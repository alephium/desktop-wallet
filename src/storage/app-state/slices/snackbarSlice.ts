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

import { createSlice } from '@reduxjs/toolkit'

import { SnackbarMessage } from '@/components/SnackbarManager'
import { syncAddressesData } from '@/storage/app-state/slices/addressesSlice'

const sliceName = 'snackbarSlice'

const initialState: SnackbarMessage = {
  text: '',
  type: 'info',
  duration: 3000 // ms
}

const snackbarSlice = createSlice({
  name: sliceName,
  initialState,
  reducers: {
    snackbarDisplayTimeExpired: () => initialState
  },
  extraReducers(builder) {
    builder.addCase(syncAddressesData.rejected, (state, action) => ({ ...state, ...action.payload }))
  }
})

export const { snackbarDisplayTimeExpired } = snackbarSlice.actions

export default snackbarSlice
