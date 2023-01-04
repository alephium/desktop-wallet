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

import { useCallback, useEffect, useRef } from 'react'

const useIdleForTooLong = (onIdleForTooLong: () => void, timeoutInMs?: number) => {
  const lastInteractionTime = useRef(new Date().getTime())

  const lastInteractionTimeThrottle = 10000 // 10 seconds

  const updateLastInteractionTime = useCallback(() => {
    const currentTime = new Date().getTime()

    if (currentTime - lastInteractionTime.current > lastInteractionTimeThrottle) {
      lastInteractionTime.current = currentTime
    }
  }, [])

  useEffect(() => {
    let checkIfIdleForTooLong: ReturnType<typeof setInterval>

    if (timeoutInMs) {
      checkIfIdleForTooLong = setInterval(() => {
        const currentTime = new Date().getTime()

        if (currentTime - lastInteractionTime.current > timeoutInMs) {
          onIdleForTooLong()
        }
      }, 2000)

      document.addEventListener('mousemove', updateLastInteractionTime)
      document.addEventListener('keydown', updateLastInteractionTime)
      document.addEventListener('scroll', updateLastInteractionTime)
    }

    return () => {
      if (checkIfIdleForTooLong) {
        document.removeEventListener('mousemove', updateLastInteractionTime)
        document.removeEventListener('keydown', updateLastInteractionTime)
        document.removeEventListener('scroll', updateLastInteractionTime)
        clearInterval(checkIfIdleForTooLong)
      }
    }
  }, [onIdleForTooLong, timeoutInMs, lastInteractionTime, updateLastInteractionTime])
}

export default useIdleForTooLong
