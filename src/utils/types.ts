// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const tryGetString = (obj: any): string | null => {
  if (typeof obj.toString === 'function') return obj.toString()
  else return null
}
