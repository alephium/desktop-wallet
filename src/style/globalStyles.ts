import { createGlobalStyle } from 'styled-components'

export const GlobalStyle = createGlobalStyle`
  html {
    font-size: 15px;
  }

  body {
    font-size: inherit;
    margin: 0;
    font-family: "Inter", sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: ${({ theme }) => theme.font.primary};
    background-color: ${({ theme }) => theme.bg.primary};
  }

  * {
    box-sizing: border-box;
  }

  h1 {
    font-size: 2.5rem;
    margin-bottom: 40px;
    margin-top: 30px;
  }

  h3 {
    font-size: 1.2rem;
  }

	input, button {
		outline: none;
	}
`
