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

import { useEffect, useRef, useState } from 'react'

export const useInterval = (callback: () => void, delay: number, shouldPause = false) => {
  const savedCallback = useRef<() => void>(() => null)

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  // Set up the interval.
  useEffect(() => {
    function tick() {
      savedCallback.current()
    }
    if (delay !== null && !shouldPause) {
      const id = setInterval(tick, delay)
      return () => clearInterval(id)
    }
  }, [delay, shouldPause])
}

export const useTimeout = (callback: () => void, delay: number) => {
  const savedCallback = useRef<() => void>()

  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  useEffect(() => {
    function tick() {
      savedCallback.current && savedCallback.current()
    }
    if (delay !== null) {
      const id = setTimeout(tick, delay)
      return () => clearTimeout(id)
    }
  }, [delay])
}

export const useWindowSize = () => {
  // Initialize state with undefined width/height so server and client renders match
  // Learn more here: https://joshwcomeau.com/react/the-perils-of-rehydration/
  const [windowSize, setWindowSize] = useState<{ width: number | undefined; height: number | undefined }>({
    width: undefined,
    height: undefined
  })
  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }
    window.addEventListener('resize', handleResize)
    handleResize()

    return () => window.removeEventListener('resize', handleResize)
  }, [])
  return windowSize
}

export function useStateWithLocalStorage<T>(localStorageKey: string, defaultValue: T) {
  const [value, setValue] = useState(localStorage.getItem(localStorageKey) || defaultValue)

  useEffect(() => {
    localStorage.setItem(localStorageKey, value as string)
  }, [localStorageKey, value])

  return [value, setValue]
}

// Helper function to run React effect only once, without eslint screaming
// eslint-disable-next-line react-hooks/exhaustive-deps
export const useMountEffect = (fun: () => void) => useEffect(fun, [])
