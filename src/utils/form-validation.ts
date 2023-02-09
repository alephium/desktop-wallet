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

import { isAddressValid } from '@alephium/sdk'

import i18n from '@/i18n'
import { store } from '@/storage/app-state/store'
import { Contact } from '@/types/contacts'

export const requiredErrorMessage = i18n.t('This field is required')

export const validateIsAddressValid = (value: string) => isAddressValid(value) || i18n.t('This address is not valid')

export const validateIsContactAddressValid = ({ address, id }: Omit<Contact, 'name'>) => {
  const state = store.getState()
  const contacts = Object.values(state.contacts.entities) as Contact[]
  const existingContact = contacts.find((contact) => contact.address === address)

  return existingContact && existingContact.id !== id
    ? i18n.t('A contact with this address already exists') + `: ${existingContact.name}`
    : true
}

export const validateIsContactNameValid = ({ name, id }: Omit<Contact, 'address'>) => {
  const state = store.getState()
  const contacts = Object.values(state.contacts.entities) as Contact[]
  const existingContact = contacts.find((contact) => contact.name.toLowerCase() === name.toLowerCase())

  return existingContact && existingContact.id !== id
    ? i18n.t('A contact with this name already exists') + `: ${existingContact.address}`
    : true
}
