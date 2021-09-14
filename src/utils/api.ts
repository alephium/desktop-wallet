interface APIError {
  error: { detail: string }
}

export const isHTTPError = (e: unknown): e is APIError => {
  return (e as APIError).error !== undefined
}
