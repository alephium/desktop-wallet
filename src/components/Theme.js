import React from 'react';
import { createMuiTheme, responsiveFontSizes, ThemeProvider } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';

const theme = responsiveFontSizes(createMuiTheme({
  typography: {
    fontSize: 12,
  },
  palette: {
    primary: {
      main: "#46AD8D",
    },
    background: {
      default: "#F5F5F5"
    },
  },
  overrides: {
    MuiButton: {
      contained: {
        color: "white",
        backgroundColor: "#46AD8D",
        "&:hover": {
          backgroundColor: "#66CD9D",
        }
      },
    },
  },
}));

export default function withTheme(WrappedComponent) {
  return class extends React.Component {
    render() {
      return (
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <WrappedComponent/>
        </ThemeProvider>
      );
    }
  };
}
