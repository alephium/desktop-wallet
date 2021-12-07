// Copyright 2018 - 2021 The Alephium Authors
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

import { css } from 'styled-components'

const tags = css`
  .tagify__tag__removeBtn {
    display: none;
  }

  .tagify__input::before {
    line-height: 22px;
  }

  .tags-dropdown {
    position: fixed;
    bottom: 10px !important;
    left: 10px !important;
    right: 10px !important;
    width: auto !important;
    top: auto !important;
    margin: 0;

    .tagify__dropdown__wrapper {
      border: none;
      border-radius: 7px;
      background-color: ${({ theme }) => (theme.name === 'light' ? theme.bg.contrast : theme.bg.primary)};
    }

    .tagify__dropdown__item {
      color: ${({ theme }) => (theme.name === 'light' ? theme.font.contrastPrimary : theme.font.primary)};
      margin: 0;
      border-radius: 0;
      padding: 10px;

      &:not(:last-child) {
        border-bottom: 1px solid ${({ theme }) => theme.border};
      }
    }

    .tagify__dropdown__item--active {
      background-color: ${({ theme }) => theme.global.accent};
    }
  }
`

export default tags
