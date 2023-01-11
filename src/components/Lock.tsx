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
import { Lock as LockIcon, Unlock } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

interface LockProps {
  unlockAt?: Date
  className?: string
}

const Lock = ({ unlockAt, className }: LockProps) => {
  const { t } = useTranslation()

  if (!unlockAt) return null

  const lockTimeInPast = unlockAt < new Date()

  return (
    <span
      className={className}
      data-tip={`${lockTimeInPast ? t`Unlocked at` : t`Unlocks at`} ${dayjs(unlockAt).format('DD/MM/YYYY hh:mm A')}`}
    >
      {lockTimeInPast ? <UnlockIconStyled /> : <LockIconStyled />}
    </span>
  )
}

export default styled(Lock)`
  display: flex;
`

const UnlockIconStyled = styled(Unlock)`
  width: 1em;
`

const LockIconStyled = styled(LockIcon)`
  width: 1em;
`
