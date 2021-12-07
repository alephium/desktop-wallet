import { css } from 'styled-components'

const resets = css`
  * {
    box-sizing: border-box;
  }

  input,
  button {
    outline: none;
    border: none;
    background: transparent;
  }

  a {
    text-decoration: none;
    color: inherit;
  }
`

export default resets
