// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const tryGetString = (obj: any): string | null => {
  return typeof obj.toString === 'function' ? obj.toString() : null
}
