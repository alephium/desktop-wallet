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
import { Contact } from '@/types/contacts'

import { DataKey, PersistentEncryptedStorage } from './encrypted-storage'

type StoreError = string | undefined

class ContactsStorage extends PersistentEncryptedStorage {
  storeContact({ mnemonic, walletName }: DataKey, contact: Contact, isPassphraseUsed?: boolean): StoreError {
    if (isPassphraseUsed) return

    const isNewContact = !contact.id
    const contacts: Contact[] = this.load({ walletName, mnemonic })

    const indexOfContactWithSameAddress = contacts.findIndex((c: Contact) => c.address === contact.address)
    const indexOfContactWithSameName = contacts.findIndex(
      (c: Contact) => c.name.toLowerCase() === contact.name.toLowerCase()
    )

    if (isNewContact) {
      if (indexOfContactWithSameAddress >= 0) return i18n.t('A contact with this address already exists')
      if (indexOfContactWithSameName >= 0) return i18n.t('A contact with this name already exists')

      contacts.push({ ...contact, id: nanoid() })
    } else {
      const indexOfContactWithSameId = contacts.findIndex((c: Contact) => c.id === contact.id)

      if (indexOfContactWithSameId < 0) return i18n.t('Could not find a contact with this ID')
      if (indexOfContactWithSameAddress >= 0 && indexOfContactWithSameAddress !== indexOfContactWithSameId)
        return i18n.t('A contact with this address already exists')
      if (indexOfContactWithSameName >= 0 && indexOfContactWithSameName !== indexOfContactWithSameId)
        return i18n.t('A contact with this name already exists')

      contacts.splice(indexOfContactWithSameId, 1, contact)
    }

    console.log(`🟠 Storing contact ${contact.name} locally`)
    this.store(JSON.stringify(contacts), { mnemonic, walletName }, isPassphraseUsed)
  }

  getContactBy(
    attr: keyof Contact,
    value: string,
    mnemonic: string,
    walletName: string,
    isPassphraseUsed?: boolean
  ): Contact | undefined {
    const contacts: Contact[] = this.load({ mnemonic, walletName }, isPassphraseUsed)

    return contacts.find((c: Contact) =>
      attr === 'name' ? c[attr].toLowerCase() === value.toLowerCase() : c[attr] === value
    )
  }
}

const version = '1'
const Storage = new ContactsStorage('contacts', version)

export default Storage
