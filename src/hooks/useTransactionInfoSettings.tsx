/*
Copyright 2018 - 2022 The Alephium Authors
This file is part of the alephium project.

The library is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with the library. If not, see <http://www.gnu.org/licenses/>.
*/

import { colord } from 'colord'
import { useTranslation } from 'react-i18next'
import { useTheme } from 'styled-components'

export const useTransactionalInfoSettings = () => {
  const theme = useTheme()
  const { t } = useTranslation('App')

  return {
    label: {
      in: t`Received`,
      out: t`Sent`,
      move: t`Moved`,
      pending: t`Pending`
    },
    amountTextColor: {
      in: theme.global.valid,
      out: theme.global.accent,
      move: theme.font.primary,
      pending: theme.font.primary
    },
    iconColor: {
      in: theme.global.valid,
      out: theme.global.accent,
      move: theme.font.secondary,
      pending: theme.font.secondary
    },
    iconBgColor: {
      in: colord(theme.global.valid).alpha(0.11).toRgbString(),
      out: colord(theme.global.accent).alpha(0.11).toRgbString(),
      move: colord(theme.font.secondary).alpha(0.11).toRgbString(),
      pending: colord(theme.font.secondary).alpha(0.11).toRgbString()
    }
  }
}
