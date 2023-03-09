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
import { AddressHash } from '@/types/addresses'

interface AddressEllipsedProps extends HTMLAttributes<HTMLDivElement> {
  addressHash: AddressHash
  disableA11y?: boolean
  disableCopy?: boolean
  className?: string
}

const AddressEllipsed = ({
  addressHash,
  disableA11y = false,
  disableCopy = false,
  className,
  ...props
}: AddressEllipsedProps) => {
  const { t } = useTranslation()

  return disableCopy ? (
    <Container className={className}>
      <Ellipsed text={addressHash} {...props} />
    </Container>
  ) : (
    <ClipboardButton textToCopy={addressHash} tooltip={t`Copy address`} disableA11y={disableA11y} className={className}>
      <Ellipsed text={addressHash} {...props} />
    </ClipboardButton>
  )
}

export default AddressEllipsed

const Container = styled.div`
  display: flex;
  align-items: center;
  overflow: hidden;
`
