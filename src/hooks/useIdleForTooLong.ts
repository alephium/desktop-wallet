// Copyright 2018 - 2021 The Alephium Authors
// This file is part of the alephium project.
//
// The library is free software: you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// The library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public License
// along with the library. If not, see <http://www.gnu.org/licenses/>.

import { useEffect, useState, useCallback } from 'react'

import { walletIdleForTooLongThreshold } from '../utils/settings'

const useIdleForTooLong = (onIdleForTooLong: () => void) => {
  const [timeOnLastInteraction, setTimeOnLastInteraction] = useState(new Date().getTime())

  const timeOnLastInteractionThrottle = 10000 // 10 seconds

  const updateTimeOnLastInteraction = useCallback(() => {
    const timeOnNewInteraction = new Date().getTime()

    if (timeOnNewInteraction - timeOnLastInteraction > timeOnLastInteractionThrottle) {
      setTimeOnLastInteraction(timeOnNewInteraction)
    }
  }, [timeOnLastInteraction])

  useEffect(() => {
    const checkIfIdleForTooLong = setInterval(() => {
      const currentTime = new Date().getTime()

      if (currentTime - timeOnLastInteraction > walletIdleForTooLongThreshold) {
        onIdleForTooLong()
      }
    }, 2000)

    document.addEventListener('mousemove', updateTimeOnLastInteraction)
    document.addEventListener('keydown', updateTimeOnLastInteraction)
    document.addEventListener('scroll', updateTimeOnLastInteraction)

    return () => {
      document.removeEventListener('mousemove', updateTimeOnLastInteraction)
      document.removeEventListener('keydown', updateTimeOnLastInteraction)
      document.removeEventListener('scroll', updateTimeOnLastInteraction)
      clearInterval(checkIfIdleForTooLong)
    }
  }, [onIdleForTooLong, timeOnLastInteraction, updateTimeOnLastInteraction])
}

export default useIdleForTooLong
