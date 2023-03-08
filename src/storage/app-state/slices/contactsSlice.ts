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

import { createAction, createEntityAdapter, createSelector, createSlice, EntityState } from '@reduxjs/toolkit'

import { Message } from '@/storage/app-state/actions'
import { activeWalletDeleted, walletLocked } from '@/storage/app-state/slices/activeWalletSlice'
import { RootState } from '@/storage/app-state/store'
import { Contact } from '@/types/contacts'

const sliceName = 'contacts'

type ContactsState = EntityState<Contact>

const contactsAdapter = createEntityAdapter<Contact>({
  sortComparer: (a, b) => a.name.localeCompare(b.name)
})

const initialState: ContactsState = contactsAdapter.getInitialState()

export const contactsSlice = createSlice({
  name: sliceName,
  initialState,
  reducers: {
    contactStoredInPersistentStorage: contactsAdapter.upsertOne,
    contactsLoadedFromPersistentStorage: contactsAdapter.setAll,
    contactDeletedFromPeristentStorage: contactsAdapter.removeOne
  },
  extraReducers(builder) {
    builder.addCase(walletLocked, () => initialState).addCase(activeWalletDeleted, () => initialState)
  }
})

export const {
  selectById: selectContactById,
  selectAll: selectAllContacts,
  selectIds: selectContactIds
} = contactsAdapter.getSelectors<RootState>((state) => state[sliceName])

export const selectContactByAddress = createSelector(
  [selectAllContacts, (_, addressHash) => addressHash],
  (contacts, addressHash) => contacts.find((contact) => contact.address === addressHash)
)

export const {
  contactStoredInPersistentStorage,
  contactsLoadedFromPersistentStorage,
  contactDeletedFromPeristentStorage
} = contactsSlice.actions

export const contactStorageFailed = createAction<Message>(`${sliceName}/contactStorageFailed`)

export default contactsSlice
