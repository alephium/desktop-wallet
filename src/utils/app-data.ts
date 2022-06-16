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

export const KEY_APPDATA = 'alephium/desktop-wallet/appdata'

export interface AppData {
  lastVersionCheckedAt: Date
}

export type TypeConstructors = DateConstructor | StringConstructor | NumberConstructor | BooleanConstructor

export const APPDATA_KEYS: Record<string, TypeConstructors> = {
  lastVersionCheckedAt: Date
}

export const toAppData = (key: string, value: string): unknown => {
  if (key === '') return value
  const TypeConstructor = APPDATA_KEYS[key]
  return (TypeConstructor && new TypeConstructor(value)) || undefined
}
