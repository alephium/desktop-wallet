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

export type AnalyticsId = string

class AnalyticsStorage {
  private static localStorageKey = 'analytics'

  private generateAnalyticsId(): AnalyticsId {
    const analyticsId = nanoid()

    window.localStorage.setItem(AnalyticsStorage.localStorageKey, analyticsId)

    return analyticsId
  }

  load(): AnalyticsId {
    const rawData = window.localStorage.getItem(AnalyticsStorage.localStorageKey)

    return rawData || this.generateAnalyticsId()
  }
}

const Storage = new AnalyticsStorage()

export default Storage
