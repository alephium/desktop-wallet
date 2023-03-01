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

import { useTranslation } from 'react-i18next'
import styled, { useTheme } from 'styled-components'

import Badge from '@/components/Badge'
import DotIcon from '@/components/DotIcon'
import { useAppSelector } from '@/hooks/redux'

const NetworkBadge = ({ className }: { className?: string }) => {
  const { t } = useTranslation()
  const theme = useTheme()
  const network = useAppSelector((state) => state.network)

  const networkStatusColor = {
    online: theme.global.valid,
    offline: theme.global.alert,
    connecting: theme.global.accent,
    uninitialized: theme.font.tertiary
  }[network.status]

  return (
    <Badge className={className} border tooltip={t('Current network')}>
      <NetworkName>{network.name}</NetworkName>
      <DotIcon color={networkStatusColor} />
    </Badge>
  )
}

export default NetworkBadge

const NetworkName = styled.span`
  margin-right: 8px;
`
