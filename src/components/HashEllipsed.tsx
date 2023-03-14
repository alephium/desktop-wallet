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

import { HTMLAttributes } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import ClipboardButton from '@/components/Buttons/ClipboardButton'
import Ellipsed from '@/components/Ellipsed'

interface HashEllipsedProps extends HTMLAttributes<HTMLDivElement> {
  hash: string
  tooltipText?: string
  disableA11y?: boolean
  disableCopy?: boolean
  className?: string
}

const HashEllipsed = ({
  hash,
  disableA11y = false,
  disableCopy = false,
  tooltipText,
  className,
  ...props
}: HashEllipsedProps) => {
  const { t } = useTranslation()

  return disableCopy ? (
    <Container className={className}>
      <Ellipsed text={hash} {...props} />
    </Container>
  ) : (
    <ClipboardButton
      textToCopy={hash}
      tooltip={tooltipText ?? t`Copy address`}
      disableA11y={disableA11y}
      className={className}
    >
      <Ellipsed text={hash} {...props} />
    </ClipboardButton>
  )
}

export default HashEllipsed

const Container = styled.div`
  display: flex;
  align-items: center;
  overflow: hidden;
`
