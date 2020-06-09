import React from 'react';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import { green, purple } from '@material-ui/core/colors/blue';

const theme = createMuiTheme({
});

export default function withTheme(WrappedComponent) {
  return class extends React.Component {
    constructor(props) {
      super(props);
    }

    render() {
      return (
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <WrappedComponent />
        </ThemeProvider>
      );
    }
  };
}
