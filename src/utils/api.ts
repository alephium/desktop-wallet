import { tryGetString } from './types'

interface APIError {
  error: { detail: string }
}

export const isHTTPError = (e: unknown): e is APIError => {
  return (e as APIError).error !== undefined
}

export const getHumanReadableError = (e: unknown, defaultErrorMessage: string) => {
  const stringifiedError = tryGetString(e)
  return isHTTPError(e) ? e.error.detail : stringifiedError || defaultErrorMessage
}
