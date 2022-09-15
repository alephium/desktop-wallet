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
import styled from 'styled-components'

interface LockProps {
  unlockAt?: Date
  className?: string
}

const Lock = ({ unlockAt, className }: LockProps) => (
  <span className={className} data-tip={dayjs(unlockAt).format('MM/DD/YYYY hh:mm A')}>
    {unlockAt ? new Date() > unlockAt ? <UnlockIconStyled /> : <LockIconStyled /> : null}
  </span>
)

export default styled(Lock)``

const UnlockIconStyled = styled(Unlock)`
  width: 1em;
`

const LockIconStyled = styled(LockIcon)`
  width: 1em;
`
