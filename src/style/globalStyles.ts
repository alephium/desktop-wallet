import { createGlobalStyle } from 'styled-components'

export const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    font-family: "Inter", sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;

    font-size: 15px;
    color: ${( { theme } ) => theme.font.primary };
    background-color: ${({theme}) => theme.bg.primary};
  }

  h1 {
    font-size: 3rem;
  }

  h3 {
    font-size: 1rem;
  }

`
