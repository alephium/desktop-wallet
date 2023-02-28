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

import { nanoid } from 'nanoid'

import i18n from '@/i18n'
import {
  getEncryptedStoragePropsFromActiveWallet,
  PersistentEncryptedStorage
} from '@/storage/persistent-storage/encryptedPersistentStorage'
import { Contact } from '@/types/contacts'

type StoreContactResult = {
  contactId?: string
  error?: string
}

class ContactsStorage extends PersistentEncryptedStorage {
  store(contact: Contact): StoreContactResult {
    const encryptedStorageProps = getEncryptedStoragePropsFromActiveWallet()

    if (encryptedStorageProps.isPassphraseUsed)
      return { error: 'Cannot use contact feature in passphrase-enabled wallets' }

    let contactId = contact.id
    const isNewContact = !contactId
    const contacts: Contact[] = this.load()

    const indexOfContactWithSameAddress = contacts.findIndex((c: Contact) => c.address === contact.address)
    const indexOfContactWithSameName = contacts.findIndex(
      (c: Contact) => c.name.toLowerCase() === contact.name.toLowerCase()
    )

    if (isNewContact) {
      if (indexOfContactWithSameAddress >= 0) return { error: i18n.t('A contact with this address already exists') }
      if (indexOfContactWithSameName >= 0) return { error: i18n.t('A contact with this name already exists') }

      contactId = nanoid()

      contacts.push({ ...contact, id: contactId })
    } else {
      const indexOfContactWithSameId = contacts.findIndex((c: Contact) => c.id === contact.id)

      if (indexOfContactWithSameId < 0) return { error: i18n.t('Could not find a contact with this ID') }
      if (indexOfContactWithSameAddress >= 0 && indexOfContactWithSameAddress !== indexOfContactWithSameId)
        return { error: i18n.t('A contact with this address already exists') }
      if (indexOfContactWithSameName >= 0 && indexOfContactWithSameName !== indexOfContactWithSameId)
        return { error: i18n.t('A contact with this name already exists') }

      contacts.splice(indexOfContactWithSameId, 1, contact)
    }

    console.log(`🟠 Storing contact ${contact.name} locally`)
    super._store(JSON.stringify(contacts), encryptedStorageProps)

    return { contactId }
  }
}

const version = '1'
const Storage = new ContactsStorage('contacts', version)

export default Storage
