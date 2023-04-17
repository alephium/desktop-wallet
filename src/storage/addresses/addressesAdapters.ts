/*
Copyright 2018 - 2023 The Alephium Authors
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

import { createEntityAdapter } from '@reduxjs/toolkit'

import { Address, BalanceHistory } from '@/types/addresses'
import { Contact } from '@/types/contacts'

export const addressesAdapter = createEntityAdapter<Address>({
  selectId: (address) => address.hash,
  sortComparer: (a, b) => {
    // Always keep main address to the top of the list
    if (a.isDefault) return -1
    if (b.isDefault) return 1
    return (b.lastUsed ?? 0) - (a.lastUsed ?? 0)
  }
})

export const contactsAdapter = createEntityAdapter<Contact>({
  sortComparer: (a, b) => a.name.localeCompare(b.name)
})

export const balanceHistoryAdapter = createEntityAdapter<BalanceHistory>({
  selectId: ({ date }) => date,
  sortComparer: (a, b) => a.date.localeCompare(b.date)
})
