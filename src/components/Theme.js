// Copyright 2018 The Alephium Authors
// This file is part of the alephium project.
//
// The library is free software: you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// The library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public License
// along with the library. If not, see <http://www.gnu.org/licenses/>.

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
