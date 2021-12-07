export const findElementByText = (element: string, text: string) => {
  const el = Array.from(document.querySelectorAll(element)).find((el) => el.textContent === text)
  if (!el) throw new Error(`Could not find element "${element}" with text "${text}"`)
  return el
}
