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
import styled from 'styled-components'

import { useGlobalContext } from '@/contexts/global'

import Badge from './Badge'

const NetworkBadge = ({ className }: { className?: string }) => {
  const { t } = useTranslation()
  const { currentNetwork } = useGlobalContext()

  return (
    <Badge className={className} border data-tooltip-content={t`Current network`}>
      {currentNetwork}
    </Badge>
  )
}

export default styled(NetworkBadge)`
  color: ${({ theme }) => theme.font.primary};
  background-color: ${({ theme }) => theme.bg.accent};
  font-weight: var(--fontWeight-semiBold);
`
