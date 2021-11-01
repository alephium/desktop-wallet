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
    // Handler to call on window resize
    function handleResize() {
      // Set window width/height to state
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }
    // Add event listener
    window.addEventListener('resize', handleResize)
    // Call handler right away so state gets updated with initial window size
    handleResize()
    // Remove event listener on cleanup
    return () => window.removeEventListener('resize', handleResize)
  }, []) // Empty array ensures that effect is only run on mount
  return windowSize
}

// Local storage hook

export function useStateWithLocalStorage<T>(localStorageKey: string, defaultValue: T) {
  const [value, setValue] = useState(localStorage.getItem(localStorageKey) || defaultValue)

  useEffect(() => {
    localStorage.setItem(localStorageKey, value as string)
  }, [localStorageKey, value])

  return [value, setValue]
}

// On mount useEffect
// (https://stackoverflow.com/questions/53120972/how-to-call-loading-function-with-react-useeffect-only-once)
// eslint-disable-next-line react-hooks/exhaustive-deps
export const useMountEffect = (fun: () => void) => useEffect(fun, [])
