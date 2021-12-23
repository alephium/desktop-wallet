/*
Copyright 2018 - 2021 The Alephium Authors
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

import { useCallback, useEffect, useState } from 'react'

import { useInterval } from '../utils/hooks'

const useIdleForTooLong = (onIdleForTooLong: () => void, timeoutInMs?: number) => {
  const [lastInteractionTime, setLastInteractionTime] = useState(new Date().getTime())

  const lastInteractionTimeThrottle = 10000 // 10 seconds

  const updateLastInteractionTime = useCallback(() => {
    const currentTime = new Date().getTime()

    if (currentTime - lastInteractionTime > lastInteractionTimeThrottle) {
      setLastInteractionTime(currentTime)
    }
  }, [lastInteractionTime])

  useEffect(() => {
    document.addEventListener('mousemove', updateLastInteractionTime)
    document.addEventListener('keydown', updateLastInteractionTime)
    document.addEventListener('scroll', updateLastInteractionTime)

    return () => {
      document.removeEventListener('mousemove', updateLastInteractionTime)
      document.removeEventListener('keydown', updateLastInteractionTime)
      document.removeEventListener('scroll', updateLastInteractionTime)
    }
  }, [updateLastInteractionTime])

  useInterval(() => {
    // Not defining a timeout avoids executing the logic
    // while still respecting the rules of hooks

    if (!timeoutInMs) return

    const currentTime = new Date().getTime()

    if (currentTime - lastInteractionTime > timeoutInMs) {
      onIdleForTooLong()
    }
  }, 2000)
}

export default useIdleForTooLong
