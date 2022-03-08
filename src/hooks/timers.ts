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

import { createContext, useContext } from 'react'

export enum Timer {
  PasswordReconfirmation = 'password_reconfirmation'
}

interface TimerContext {
  timers: Map<string, Date>
}

const context = createContext<TimerContext>({ timers: new Map() })

//
// A global timer is necessary since time must be tracked across all states of
// the application.
//
export const useGlobalTimer = (name: string, waitUntil = 0): [number, () => void] => {
  const { timers } = useContext(context)

  let start = timers.get(name)
  if (start === undefined) {
    start = new Date()
    timers.set(name, start)
  }

  const now = new Date()

  const timeLeftInMillis = Math.max(0, waitUntil - (now.getTime() - start.getTime()))
  return [
    timeLeftInMillis,

    // A mechanism to reset a timer at any point
    () => timers.set(name, new Date())
  ]
}
