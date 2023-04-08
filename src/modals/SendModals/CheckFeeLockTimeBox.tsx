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

import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import Amount from '@/components/Amount'
import Box from '@/components/Box'
import HorizontalDivider from '@/components/PageComponents/HorizontalDivider'
import InfoRow from '@/modals/SendModals/InfoRow'
import { formatDateForDisplay } from '@/utils/misc'

interface CheckFeeLockTimeBoxProps {
  fee: bigint
  lockTime?: Date
  className?: string
}

const CheckFeeLockTimeBox = ({ fee, lockTime, className }: CheckFeeLockTimeBoxProps) => {
  const { t } = useTranslation()

  return (
    <Box className={className}>
      <InfoRow label={t('Expected fee')}>
        <Amount value={fee} fullPrecision />
      </InfoRow>
      {lockTime && (
        <>
          <HorizontalDivider />
          <InfoRow label={t('Unlocks at')}>
            <UnlocksAt>
              {formatDateForDisplay(lockTime)}
              <FromNow>({dayjs(lockTime).fromNow()})</FromNow>
            </UnlocksAt>
          </InfoRow>
        </>
      )}
    </Box>
  )
}

export default CheckFeeLockTimeBox

const UnlocksAt = styled.div`
  display: flex;
  gap: var(--spacing-1);
`

const FromNow = styled.div`
  color: ${({ theme }) => theme.font.secondary};
`
